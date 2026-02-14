import Call from "../models/Call.js";
import User from "../models/User.js";

// Get call history for authenticated user
export const getCallHistory = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Get all calls where user is either caller or receiver
        const calls = await Call.find({
            $or: [{ caller: userId }, { receiver: userId }]
        })
        .populate("caller", "fullName username profilePic")
        .populate("receiver", "fullName username profilePic")
        .sort({ createdAt: -1 })
        .limit(100); // Limit to last 100 calls
        
        // Format calls for frontend
        const formattedCalls = calls.map(call => {
            const isCaller = call.caller._id.toString() === userId.toString();
            const otherUser = isCaller ? call.receiver : call.caller;
            
            // Determine call type from user's perspective
            let type;
            if (call.status === 'missed' && !isCaller) {
                type = 'missed';
            } else if (call.status === 'answered' || call.status === 'rejected' || call.status === 'cancelled') {
                type = isCaller ? 'outgoing' : 'incoming';
            } else {
                type = 'missed';
            }
            
            return {
                _id: call._id,
                userId: otherUser._id,
                name: otherUser.fullName,
                username: otherUser.username,
                profilePic: otherUser.profilePic,
                type: type,
                isVideo: call.callType === 'video',
                timestamp: call.createdAt,
                duration: call.duration,
                status: call.status
            };
        });
        
        res.status(200).json(formattedCalls);
    } catch (error) {
        console.log("Error in getCallHistory:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Create a new call record
export const createCall = async (req, res) => {
    try {
        const { receiverId, callType } = req.body;
        const callerId = req.user._id;
        
        if (!receiverId || !callType) {
            return res.status(400).json({ message: "Receiver and call type are required" });
        }
        
        if (!["voice", "video"].includes(callType)) {
            return res.status(400).json({ message: "Invalid call type" });
        }
        
        // Check if receiver exists
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // Create call record
        const call = new Call({
            caller: callerId,
            receiver: receiverId,
            callType: callType,
            status: "missed", // Default to missed, will be updated when answered
            startedAt: new Date()
        });
        
        await call.save();
        
        res.status(201).json({
            _id: call._id,
            callType: call.callType,
            status: call.status
        });
    } catch (error) {
        console.log("Error in createCall:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Update call status (answered, rejected, ended)
export const updateCallStatus = async (req, res) => {
    try {
        const { callId } = req.params;
        const { status, duration } = req.body;
        
        if (!["answered", "rejected", "cancelled"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }
        
        const call = await Call.findById(callId);
        if (!call) {
            return res.status(404).json({ message: "Call not found" });
        }
        
        // Verify user is part of this call
        const userId = req.user._id.toString();
        if (call.caller.toString() !== userId && call.receiver.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized" });
        }
        
        call.status = status;
        call.endedAt = new Date();
        
        if (duration !== undefined) {
            call.duration = duration;
        }
        
        await call.save();
        
        res.status(200).json({
            _id: call._id,
            status: call.status,
            duration: call.duration
        });
    } catch (error) {
        console.log("Error in updateCallStatus:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Delete call from history
export const deleteCall = async (req, res) => {
    try {
        const { callId } = req.params;
        const userId = req.user._id;
        
        const call = await Call.findById(callId);
        if (!call) {
            return res.status(404).json({ message: "Call not found" });
        }
        
        // Verify user is part of this call
        if (call.caller.toString() !== userId.toString() && call.receiver.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }
        
        await Call.findByIdAndDelete(callId);
        
        res.status(200).json({ message: "Call deleted successfully" });
    } catch (error) {
        console.log("Error in deleteCall:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get missed calls count
export const getMissedCallsCount = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const missedCallsCount = await Call.countDocuments({
            receiver: userId,
            status: "missed"
        });
        
        res.status(200).json({ count: missedCallsCount });
    } catch (error) {
        console.log("Error in getMissedCallsCount:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
