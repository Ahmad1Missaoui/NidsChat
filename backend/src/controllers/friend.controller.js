import User from "../models/User.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

// Send friend request
export const sendFriendRequest = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { receiverId } = req.params;

    if (senderId.toString() === receiverId) {
      return res.status(400).json({ message: "Cannot send friend request to yourself" });
    }

    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!receiver) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already friends
    if (sender.friends.some((id) => id.toString() === receiverId)) {
      return res.status(400).json({ message: "Already friends" });
    }

    // Check if already sent request
    if (sender.friendRequestsSent.some((id) => id.toString() === receiverId)) {
      return res.status(400).json({ message: "Friend request already sent" });
    }

    // Check if receiver already sent request to sender
    if (sender.friendRequestsReceived.some((id) => id.toString() === receiverId)) {
      return res.status(400).json({ message: "This user has already sent you a friend request" });
    }

    // Check if sender is blocked by receiver
    if (receiver.blockedUsers.some((id) => id.toString() === senderId.toString())) {
      return res.status(403).json({ message: "Cannot send friend request to this user" });
    }

    // Check if receiver is blocked by sender
    if (sender.blockedUsers.some((id) => id.toString() === receiverId)) {
      return res.status(403).json({ message: "You have blocked this user" });
    }

    // Check privacy settings
    if (receiver.privacySettings.canBeAddedBy === "nobody") {
      return res.status(403).json({ message: "This user does not accept friend requests" });
    }

    // Add to sent/received arrays
    sender.friendRequestsSent.push(receiverId);
    receiver.friendRequestsReceived.push(senderId);

    await sender.save();
    await receiver.save();

    // Send real-time notification to receiver
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newFriendRequest", {
        _id: sender._id,
        username: sender.username,
        fullName: sender.fullName,
        profilePic: sender.profilePic,
      });
    }

    res.status(200).json({ message: "Friend request sent successfully" });
  } catch (error) {
    console.log("Error in sendFriendRequest:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Accept friend request
export const acceptFriendRequest = async (req, res) => {
  try {
    const userId = req.user._id;
    const { senderId } = req.params;

    const user = await User.findById(userId);
    const sender = await User.findById(senderId);

    if (!sender) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if request exists
    if (!user.friendRequestsReceived.some((id) => id.toString() === senderId)) {
      return res.status(400).json({ message: "No friend request from this user" });
    }

    // Remove from requests arrays
    user.friendRequestsReceived = user.friendRequestsReceived.filter(
      (id) => id.toString() !== senderId
    );
    sender.friendRequestsSent = sender.friendRequestsSent.filter(
      (id) => id.toString() !== userId.toString()
    );

    // Add to friends arrays
    user.friends.push(senderId);
    sender.friends.push(userId);

    await user.save();
    await sender.save();

    // Send real-time notification to sender
    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("friendRequestAccepted", {
        _id: user._id,
        username: user.username,
        fullName: user.fullName,
        profilePic: user.profilePic,
      });
    }

    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.log("Error in acceptFriendRequest:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Reject friend request
export const rejectFriendRequest = async (req, res) => {
  try {
    const userId = req.user._id;
    const { senderId } = req.params;

    const user = await User.findById(userId);
    const sender = await User.findById(senderId);

    if (!sender) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if request exists
    if (!user.friendRequestsReceived.some((id) => id.toString() === senderId)) {
      return res.status(400).json({ message: "No friend request from this user" });
    }

    // Remove from requests arrays
    user.friendRequestsReceived = user.friendRequestsReceived.filter(
      (id) => id.toString() !== senderId
    );
    sender.friendRequestsSent = sender.friendRequestsSent.filter(
      (id) => id.toString() !== userId.toString()
    );

    await user.save();
    await sender.save();

    res.status(200).json({ message: "Friend request rejected" });
  } catch (error) {
    console.log("Error in rejectFriendRequest:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Remove friend
export const removeFriend = async (req, res) => {
  try {
    const userId = req.user._id;
    const { friendId } = req.params;

    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!friend) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if they are friends
    if (!user.friends.some((id) => id.toString() === friendId)) {
      return res.status(400).json({ message: "Not friends with this user" });
    }

    // Remove from friends arrays
    user.friends = user.friends.filter((id) => id.toString() !== friendId);
    friend.friends = friend.friends.filter((id) => id.toString() !== userId.toString());

    await user.save();
    await friend.save();

    res.status(200).json({ message: "Friend removed successfully" });
  } catch (error) {
    console.log("Error in removeFriend:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Block user
export const blockUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const { userToBlockId } = req.params;

    if (userId.toString() === userToBlockId) {
      return res.status(400).json({ message: "Cannot block yourself" });
    }

    const user = await User.findById(userId);
    const userToBlock = await User.findById(userToBlockId);

    if (!userToBlock) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already blocked
    const alreadyBlocked = user.blockedUsers.some((id) => id.toString() === userToBlockId);
    if (alreadyBlocked) {
      return res.status(400).json({ message: "User already blocked" });
    }

    // Add to blocked list (keep friendship intact, only block messages/calls)
    user.blockedUsers.push(userToBlockId);

    // Remove any pending friend requests
    user.friendRequestsSent = user.friendRequestsSent.filter(
      (id) => id.toString() !== userToBlockId
    );
    user.friendRequestsReceived = user.friendRequestsReceived.filter(
      (id) => id.toString() !== userToBlockId
    );
    userToBlock.friendRequestsSent = userToBlock.friendRequestsSent.filter(
      (id) => id.toString() !== userId.toString()
    );
    userToBlock.friendRequestsReceived = userToBlock.friendRequestsReceived.filter(
      (id) => id.toString() !== userId.toString()
    );

    await user.save();
    await userToBlock.save();

    res.status(200).json({ message: "User blocked successfully" });
  } catch (error) {
    console.log("Error in blockUser:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Unblock user
export const unblockUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const { userToUnblockId } = req.params;

    const user = await User.findById(userId);
    const userToUnblock = await User.findById(userToUnblockId);

    if (!userToUnblock) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is blocked
    const isBlocked = user.blockedUsers.some((id) => id.toString() === userToUnblockId);
    if (!isBlocked) {
      return res.status(400).json({ message: "User is not blocked" });
    }

    // Remove from blocked list (friendship was never removed, so no need to restore)
    user.blockedUsers = user.blockedUsers.filter((id) => id.toString() !== userToUnblockId);

    await user.save();

    res.status(200).json({ message: "User unblocked successfully" });
  } catch (error) {
    console.log("Error in unblockUser:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get friend requests
export const getFriendRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate(
      "friendRequestsReceived",
      "username fullName profilePic"
    );

    res.status(200).json(user.friendRequestsReceived);
  } catch (error) {
    console.log("Error in getFriendRequests:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get friends list
export const getFriends = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate(
      "friends",
      "username fullName profilePic isOnline lastSeen"
    );

    res.status(200).json(user.friends);
  } catch (error) {
    console.log("Error in getFriends:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get blocked users
export const getBlockedUsers = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate(
      "blockedUsers",
      "username fullName profilePic"
    );

    res.status(200).json(user.blockedUsers);
  } catch (error) {
    console.log("Error in getBlockedUsers:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update privacy settings
export const updatePrivacySettings = async (req, res) => {
  try {
    const userId = req.user._id;
    const { canBeAddedBy, showOnlineStatus } = req.body;

    const user = await User.findById(userId);

    if (canBeAddedBy) {
      if (!["everyone", "friends_of_friends", "nobody"].includes(canBeAddedBy)) {
        return res.status(400).json({ message: "Invalid privacy setting" });
      }
      user.privacySettings.canBeAddedBy = canBeAddedBy;
    }

    if (showOnlineStatus !== undefined) {
      user.privacySettings.showOnlineStatus = showOnlineStatus;
    }

    await user.save();

    res.status(200).json({ message: "Privacy settings updated", privacySettings: user.privacySettings });
  } catch (error) {
    console.log("Error in updatePrivacySettings:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Check if users are friends
export const checkFriendship = async (req, res) => {
  try {
    const userId = req.user._id;
    const { otherUserId } = req.params;

    const user = await User.findById(userId);
    const otherUser = await User.findById(otherUserId).select("blockedUsers");

    const isFriend = user.friends.some((id) => id.toString() === otherUserId);
    const requestSent = user.friendRequestsSent.some((id) => id.toString() === otherUserId);
    const requestReceived = user.friendRequestsReceived.some((id) => id.toString() === otherUserId);
    const isBlocked = user.blockedUsers.some((id) => id.toString() === otherUserId);
    const isBlockedByOther = otherUser?.blockedUsers?.some((id) => id.toString() === userId.toString()) || false;

    res.status(200).json({
      isFriend,
      requestSent,
      requestReceived,
      isBlocked,
      isBlockedByOther,
    });
  } catch (error) {
    console.log("Error in checkFriendship:", error);
    res.status(500).json({ message: "Server error" });
  }
};
