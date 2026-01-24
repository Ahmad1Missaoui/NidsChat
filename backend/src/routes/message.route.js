import express from 'express';
import { get } from 'mongoose';
import { getAllContacts , getMessageById} from '../controllers/message.controller.js';
import { ProtectRoute } from '../middleware/auth.middleware.js';
import {sendMessage} from '../controllers/message.controller.js';
import {getAllChats} from '../controllers/message.controller.js';
import {ArcjetProtection} from '../middleware/arcjet.middleware.js';

const router =express.Router();

router.use(ArcjetProtection, ProtectRoute);

  router.get("/contacts",getAllContacts);
  router.get("/chats",getAllChats);
  router.get("/:id",getMessageById);
  router.post("/send/:id",sendMessage);   



export default router;