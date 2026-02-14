import User from "../models/User.js";

// Search users (for adding friends)
export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.user._id;
    
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }
    
    const user = await User.findById(userId);
    
    // Search by username or full name
    const users = await User.find({
      _id: { $ne: userId }, // Exclude current user
      $and: [
        { _id: { $nin: user.blockedUsers } }, // Exclude blocked users
        {
          $or: [
            { username: { $regex: query, $options: "i" } },
            { fullName: { $regex: query, $options: "i" } },
          ],
        },
      ],
    })
      .select("username fullName profilePic")
      .limit(20);
    
    res.status(200).json(users);
  } catch (error) {
    console.log("Error in searchUsers:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getUserProfile:", error);
    res.status(500).json({ message: "Server error" });
  }
};
