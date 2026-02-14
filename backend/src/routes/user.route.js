import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { searchUsers, getUserProfile } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/search", protectRoute, searchUsers);
router.get("/:userId", protectRoute, getUserProfile);

export default router;
