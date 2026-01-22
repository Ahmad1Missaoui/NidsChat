import express from 'express';
import { signup } from '../controllers/auth.controller.js';
import { login } from '../controllers/auth.controller.js';
import { logout } from '../controllers/auth.controller.js';
import { updateProfile } from '../controllers/auth.controller.js';
import { ProtectRoute } from '../middleware/auth.middleware.js';
import arcjet from '@arcjet/node';
import { ArcjetProtection } from '../middleware/arcjet.middleware.js';

const router =express.Router();

router.use(ArcjetProtection);
router.post("/signup",signup);
router.post("/login",login)
router.post("/logout",logout);
router.put("/update-profile", ProtectRoute, updateProfile);

router.get("/check", ProtectRoute, (req,res) => res.status(200).json(req.user));

export default router;