import express from "express";
import { signup, login, logout, updateProfile, changePassword, googleAuth, checkUsername, verifyEmail, resendVerification } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";

const router = express.Router();

router.use(arcjetProtection);

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/google", googleAuth);
router.get("/check-username/:username", checkUsername);
router.get("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);

router.put("/update-profile", protectRoute, updateProfile);
router.put("/change-password", protectRoute, changePassword);

router.get("/check", protectRoute, (req, res) => res.status(200).json(req.user));

export default router;