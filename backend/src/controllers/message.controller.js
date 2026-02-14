
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import Group from "../models/Group.js";

export const getAllContacts = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    
    // Get user with friends populated
    const user = await User.findById(loggedInUserId).populate(
      "friends",
      "username fullName profilePic isOnline lastSeen"
    );

    // Return only friends
    res.status(200).json(user.friends);
  } catch (error) {
    console.log("Error in getAllContacts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMessagesByUserId = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: userToChatId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image, document, documentName, video, voice, fileType } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!text && !image && !document && !video && !voice) {
      return res.status(400).json({ message: "Message content is required." });
    }
    if (senderId.equals(receiverId)) {
      return res.status(400).json({ message: "Cannot send messages to yourself." });
    }
    
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found." });
    }
    
    const sender = await User.findById(senderId);
    
    // Check if users are friends (use some() for proper ObjectId comparison)
    const areFriends = sender.friends.some((id) => id.toString() === receiverId.toString());
    if (!areFriends) {
      return res.status(403).json({ message: "You can only send messages to friends." });
    }
    
    // Check if sender is blocked by receiver
    const isSenderBlocked = receiver.blockedUsers.some((id) => id.toString() === senderId.toString());
    if (isSenderBlocked) {
      return res.status(403).json({ message: "Cannot send message to this user." });
    }
    
    // Check if receiver is blocked by sender
    const isReceiverBlocked = sender.blockedUsers.some((id) => id.toString() === receiverId.toString());
    if (isReceiverBlocked) {
      return res.status(403).json({ message: "You have blocked this user." });
    }

    let imageUrl, documentUrl, videoUrl, voiceUrl;
    
    // Upload image to cloudinary
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }
    
    // Upload document to cloudinary
    if (document) {
      const uploadResponse = await cloudinary.uploader.upload(document, {
        resource_type: 'raw',
        folder: 'documents'
      });
      documentUrl = uploadResponse.secure_url;
    }
    
    // Upload video to cloudinary
    if (video) {
      const uploadResponse = await cloudinary.uploader.upload(video, {
        resource_type: 'video',
        folder: 'videos'
      });
      videoUrl = uploadResponse.secure_url;
    }
    
    // Upload voice to cloudinary
    if (voice) {
      const uploadResponse = await cloudinary.uploader.upload(voice, {
        resource_type: 'video', // audio files use video resource type
        folder: 'voice'
      });
      voiceUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      document: documentUrl,
      documentName,
      video: videoUrl,
      voice: voiceUrl,
      fileType: fileType || 'text',
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getChatPartners = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // find all the messages where the logged-in user is either sender or receiver
    const messages = await Message.find({
      $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
    });

    const chatPartnerIds = [
      ...new Set(
        messages.map((msg) =>
          msg.senderId.toString() === loggedInUserId.toString()
            ? msg.receiverId.toString()
            : msg.senderId.toString()
        )
      ),
    ];

    const chatPartners = await User.find({ _id: { $in: chatPartnerIds } }).select("-password");

    res.status(200).json(chatPartners);
  } catch (error) {
    console.error("Error in getChatPartners: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const { deleteForEveryone } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Check if user is the sender
    const sender = message.senderId || message.sender;
    if (sender.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You can only delete your own messages" });
    }

    if (deleteForEveryone) {
      // Mark as deleted for everyone
      message.isDeleted = true;
      message.text = "This message was deleted";
      message.image = null;
      message.document = null;
      message.video = null;
      message.voice = null;
      await message.save();

      if (message.groupId) {
        // Handle group message deletion
        const group = await Group.findById(message.groupId);
        if (group) {
          group.members.forEach((memberId) => {
            if (memberId.toString() !== userId.toString()) {
              const memberSocketId = getReceiverSocketId(memberId.toString());
              if (memberSocketId) {
                io.to(memberSocketId).emit("messageDeleted", {
                  messageId: message._id,
                  isDeleted: true,
                  groupId: message.groupId
                });
              }
            }
          });
        }
      } else {
        // Handle direct message deletion
        const receiverSocketId = getReceiverSocketId(message.receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("messageDeleted", {
            messageId: message._id,
            isDeleted: true,
          });
        }
      }

      res.status(200).json({ message: "Message deleted for everyone", deletedMessage: message });
    } else {
      // Delete only for sender (remove from database)
      await Message.findByIdAndDelete(messageId);
      res.status(200).json({ message: "Message deleted for you" });
    }
  } catch (error) {
    console.log("Error in deleteMessage controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const reactToMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body; // e.g., 'like', 'love', 'disagree'
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    // Check if user already reacted
    const existingReactionIndex = message.reactions.findIndex(
      (r) => r.userId.toString() === userId.toString()
    );

    if (existingReactionIndex !== -1) {
      // If same emoji, remove reaction (toggle)
      if (message.reactions[existingReactionIndex].emoji === emoji) {
        message.reactions.splice(existingReactionIndex, 1);
      } else {
        // Change emoji
        message.reactions[existingReactionIndex].emoji = emoji;
      }
    } else {
      // Add new reaction
      message.reactions.push({ userId: userId, emoji });
    }

    await message.save();

     // Populate userId for immediate UI update
     await message.populate("reactions.userId", "fullName profilePic");

    // Notify others
    const receiverId = message.senderId && message.senderId.toString() === userId.toString() ? message.receiverId : message.senderId;
    
    // If it's a group message
    if (message.groupId) {
       io.to(message.groupId.toString()).emit("messageReaction", { messageId, reactions: message.reactions, groupId: message.groupId });
    } else {
       // Direct message
       if(receiverId){
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("messageReaction", { messageId, reactions: message.reactions });
        }
       }
    }

    res.status(200).json(message);
  } catch (error) {
    console.log("Error in reactToMessage:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id: senderId } = req.params;
    const userId = req.user._id;

    // Mark all messages from the sender as read by the current user
    await Message.updateMany(
      { senderId: senderId, receiverId: userId },
      { $addToSet: { readBy: userId } }
    );

    // Notify the sender that their messages have been read
    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messagesRead", { conversationId: userId });
    }

    res.status(200).json({ message: "Conversation marked as read" });
  } catch (error) {
    console.log("Error in markAsRead:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get unread messages count for a specific user
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: senderId } = req.params;

    const unreadCount = await Message.countDocuments({
      senderId: senderId,
      receiverId: userId,
      readBy: { $ne: userId }
    });

    res.status(200).json({ count: unreadCount });
  } catch (error) {
    console.log("Error in getUnreadCount:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get total unread messages count across all conversations
export const getTotalUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;

    const unreadCount = await Message.countDocuments({
      receiverId: userId,
      readBy: { $ne: userId }
    });

    res.status(200).json({ count: unreadCount });
  } catch (error) {
    console.log("Error in getTotalUnreadCount:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get unread counts by conversation
export const getUnreadCountsByConversation = async (req, res) => {
  try {
    const userId = req.user._id;

    // Aggregate unread messages grouped by sender
    const unreadCounts = await Message.aggregate([
      {
        $match: {
          receiverId: userId,
          readBy: { $ne: userId }
        }
      },
      {
        $group: {
          _id: "$senderId",
          count: { $sum: 1 }
        }
      }
    ]);

    // Format response as an object with userId as key
    const countsMap = {};
    unreadCounts.forEach(item => {
      countsMap[item._id.toString()] = item.count;
    });

    res.status(200).json(countsMap);
  } catch (error) {
    console.log("Error in getUnreadCountsByConversation:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
