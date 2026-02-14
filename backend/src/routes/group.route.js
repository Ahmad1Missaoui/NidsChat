import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createGroup,
  getUserGroups,
  getGroupDetails,
  addMemberToGroup,
  removeMemberFromGroup,
  leaveGroup,
  deleteGroup,
  updateGroup,
  getGroupMessages,
  sendGroupMessage,
} from "../controllers/group.controller.js";

const router = express.Router();

router.post("/", protectRoute, createGroup);
router.get("/", protectRoute, getUserGroups);
router.get("/:groupId", protectRoute, getGroupDetails);
router.get("/:groupId/messages", protectRoute, getGroupMessages);
router.post("/:groupId/messages", protectRoute, sendGroupMessage);
router.post("/:groupId/members", protectRoute, addMemberToGroup);
router.delete("/:groupId/members/:memberId", protectRoute, removeMemberFromGroup);
router.post("/:groupId/leave", protectRoute, leaveGroup);
router.delete("/:groupId", protectRoute, deleteGroup);
router.put("/:groupId", protectRoute, updateGroup);

export default router;
