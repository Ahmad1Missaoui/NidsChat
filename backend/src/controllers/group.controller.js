import Group from "../models/Group.js";
import User from "../models/User.js";
import Message from "../models/Message.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

// Create group
export const createGroup = async (req, res) => {
  try {
    const { name, description, members, avatar } = req.body;
    const userId = req.user._id;

    if (!name) {
      return res.status(400).json({ message: "Group name is required" });
    }

    if (!members || members.length === 0) {
      return res.status(400).json({ message: "At least one member is required" });
    }

    // Verify all members are friends
    const user = await User.findById(userId);
    const invalidMembers = members.filter((memberId) => !user.friends.includes(memberId));

    if (invalidMembers.length > 0) {
      return res.status(400).json({ message: "Can only add friends to group" });
    }

    let avatarUrl = "";
    if (avatar) {
      const uploadResponse = await cloudinary.uploader.upload(avatar);
      avatarUrl = uploadResponse.secure_url;
    }

    // Create group with creator as admin
    const newGroup = new Group({
      name,
      description: description || "",
      groupPic: avatarUrl,
      admin: userId,
      admins: [userId],
      members: [userId, ...members],
      createdBy: userId,
    });

    await newGroup.save();

    // Add group to all members' groups array
    await User.updateMany(
      { _id: { $in: [userId, ...members] } },
      { $push: { groups: newGroup._id } }
    );

    // Populate the group data before sending response
    const populatedGroup = await Group.findById(newGroup._id)
      .populate("members", "username fullName profilePic")
      .populate("admin", "username fullName profilePic")
      .populate("admins", "username fullName profilePic");

    // Notify all members
    members.forEach((memberId) => {
      const memberSocketId = getReceiverSocketId(memberId);
      if (memberSocketId) {
        io.to(memberSocketId).emit("addedToGroup", {
          group: populatedGroup,
          addedBy: {
            _id: user._id,
            username: user.username,
            fullName: user.fullName,
          },
        });
      }
    });

    res.status(201).json(populatedGroup);
  } catch (error) {
    console.log("Error in createGroup:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get user's groups
export const getUserGroups = async (req, res) => {
  try {
    const userId = req.user._id;

    const groups = await Group.find({ members: userId })
      .populate("members", "username fullName profilePic")
      .populate("admin", "username fullName profilePic")
      .populate("admins", "username fullName profilePic")
      .sort({ updatedAt: -1 });

    res.status(200).json(groups);
  } catch (error) {
    console.log("Error in getUserGroups:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get group details
export const getGroupDetails = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(groupId)
      .populate("members", "username fullName profilePic isOnline")
      .populate("admin", "username fullName profilePic")
      .populate("admins", "username fullName profilePic");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user is a member
    if (!group.members.some((member) => member._id.toString() === userId.toString())) {
      return res.status(403).json({ message: "Not a member of this group" });
    }

    res.status(200).json(group);
  } catch (error) {
    console.log("Error in getGroupDetails:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Add member to group
export const addMemberToGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { memberId } = req.body;
    const userId = req.user._id;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user is admin
    if (group.admin.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only admin can add members" });
    }

    // Check if member is already in group
    if (group.members.includes(memberId)) {
      return res.status(400).json({ message: "User is already a member" });
    }

    // Check if they are friends
    const user = await User.findById(userId);
    if (!user.friends.includes(memberId)) {
      return res.status(400).json({ message: "Can only add friends to group" });
    }

    // Add member
    group.members.push(memberId);
    await group.save();

    // Add group to member's groups array
    await User.findByIdAndUpdate(memberId, { $push: { groups: groupId } });

    // Notify the new member
    const memberSocketId = getReceiverSocketId(memberId);
    if (memberSocketId) {
      io.to(memberSocketId).emit("addedToGroup", {
        group,
        addedBy: {
          _id: user._id,
          username: user.username,
          fullName: user.fullName,
        },
      });
    }

    const updatedGroup = await Group.findById(groupId)
      .populate("members", "username fullName profilePic")
      .populate("admin", "username fullName profilePic");

    res.status(200).json(updatedGroup);
  } catch (error) {
    console.log("Error in addMemberToGroup:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Remove member from group
export const removeMemberFromGroup = async (req, res) => {
  try {
    const { groupId, memberId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user is admin
    if (group.admin.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only admin can remove members" });
    }

    // Cannot remove admin
    if (group.admin.toString() === memberId) {
      return res.status(400).json({ message: "Cannot remove admin from group" });
    }

    // Remove member
    group.members = group.members.filter((id) => id.toString() !== memberId);
    await group.save();

    // Remove group from member's groups array
    await User.findByIdAndUpdate(memberId, { $pull: { groups: groupId } });

    res.status(200).json({ message: "Member removed successfully" });
  } catch (error) {
    console.log("Error in removeMemberFromGroup:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Leave group
export const leaveGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Admin cannot leave, must transfer admin first or delete group
    if (group.admin.toString() === userId.toString()) {
      return res.status(400).json({ message: "Admin must transfer ownership or delete group" });
    }

    // Remove user from members
    group.members = group.members.filter((id) => id.toString() !== userId.toString());
    await group.save();

    // Remove group from user's groups array
    await User.findByIdAndUpdate(userId, { $pull: { groups: groupId } });

    res.status(200).json({ message: "Left group successfully" });
  } catch (error) {
    console.log("Error in leaveGroup:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete group
export const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user is admin
    if (group.admin.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only admin can delete group" });
    }

    // Remove group from all members' groups array
    await User.updateMany({ _id: { $in: group.members } }, { $pull: { groups: groupId } });

    // Delete group
    await Group.findByIdAndDelete(groupId);

    res.status(200).json({ message: "Group deleted successfully" });
  } catch (error) {
    console.log("Error in deleteGroup:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update group
export const updateGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, description, groupPic } = req.body;
    const userId = req.user._id;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user is admin
    if (group.admin.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only admin can update group" });
    }

    if (name) group.name = name;
    if (description !== undefined) group.description = description;

    // Upload group picture if provided
    if (groupPic) {
      const uploadResponse = await cloudinary.uploader.upload(groupPic);
      group.groupPic = uploadResponse.secure_url;
    }

    await group.save();

    const updatedGroup = await Group.findById(groupId)
      .populate("members", "username fullName profilePic")
      .populate("admin", "username fullName profilePic");

    res.status(200).json(updatedGroup);
  } catch (error) {
    console.log("Error in updateGroup:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get group messages
export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user is a member
    if (!group.members.includes(userId)) {
      return res.status(403).json({ message: "You are not a member of this group" });
    }

    // Get messages for this group
    const messages = await Message.find({ groupId })
      .populate("sender", "username fullName profilePic")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getGroupMessages:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Send group message
export const sendGroupMessage = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { text, image, document, documentName, video, voice, fileType } = req.body;
    const senderId = req.user._id;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user is a member
    if (!group.members.includes(senderId)) {
      return res.status(403).json({ message: "You are not a member of this group" });
    }

    let imageUrl, documentUrl, videoUrl, voiceUrl;
    
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }
    
    if (document) {
      const uploadResponse = await cloudinary.uploader.upload(document, {
        resource_type: 'auto',
        format: 'pdf',
      });
      documentUrl = uploadResponse.secure_url;
    }
    
    if (video) {
      const uploadResponse = await cloudinary.uploader.upload(video, {
        resource_type: 'video',
      });
      videoUrl = uploadResponse.secure_url;
    }
    
    if (voice) {
      const uploadResponse = await cloudinary.uploader.upload(voice, {
        resource_type: 'video',
      });
      voiceUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      sender: senderId,
      groupId,
      text,
      image: imageUrl,
      document: documentUrl,
      documentName: documentName || 'document',
      video: videoUrl,
      voice: voiceUrl,
      fileType: fileType || 'text',
    });

    await newMessage.save();

    // Update group's last message
    group.lastMessage = {
      text,
      sender: senderId,
      createdAt: new Date(),
    };
    await group.save();

    // Populate sender info
    await newMessage.populate("sender", "username fullName profilePic");

    // Emit to all group members
    group.members.forEach((memberId) => {
      if (memberId.toString() !== senderId.toString()) {
        const memberSocketId = getReceiverSocketId(memberId.toString());
        if (memberSocketId) {
          io.to(memberSocketId).emit("newGroupMessage", newMessage);
        }
      }
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendGroupMessage:", error);
    res.status(500).json({ message: "Server error" });
  }
};

