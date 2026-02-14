import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  blockUser,
  unblockUser,
  getFriendRequests,
  getFriends,
  getBlockedUsers,
  updatePrivacySettings,
  checkFriendship,
} from "../controllers/friend.controller.js";

const router = express.Router();

// Friend requests
router.post("/request/:receiverId", protectRoute, sendFriendRequest);
router.post("/accept/:senderId", protectRoute, acceptFriendRequest);
router.post("/reject/:senderId", protectRoute, rejectFriendRequest);
router.get("/requests", protectRoute, getFriendRequests);

// Friends management
router.get("/", protectRoute, getFriends);
router.delete("/:friendId", protectRoute, removeFriend);
router.get("/check/:otherUserId", protectRoute, checkFriendship);

// Block/Unblock
router.post("/block/:userToBlockId", protectRoute, blockUser);
router.post("/unblock/:userToUnblockId", protectRoute, unblockUser);
router.get("/blocked", protectRoute, getBlockedUsers);

// Privacy settings
router.put("/privacy", protectRoute, updatePrivacySettings);

export default router;
