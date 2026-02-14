import express from 'express';
import * as aiController from '../controllers/ai.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

// All AI routes require authentication
router.use(protectRoute);

// Document summarization
router.post('/summarize', aiController.summarizeDocument);

// Smart reply suggestions
router.post('/smart-replies', aiController.generateSmartReplies);

// Message translation
router.post('/translate', aiController.translateMessage);

// AI assistant chat
router.post('/chat', aiController.chatWithAssistant);

export default router;
