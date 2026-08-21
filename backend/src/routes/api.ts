import { Router } from "express";
import { login, getMe } from "../controllers/authController";
import { searchUsers } from "../controllers/userController";
import {
  listConversations,
  startDirect,
  createGroup,
  renameGroup,
  promoteAdmin,
  addParticipants,
  removeParticipant,
} from "../controllers/conversationController";
import { sendMessage, getMessages } from "../controllers/messageController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// Auth routes
router.post("/auth/login", login);
router.get("/auth/me", authMiddleware, getMe);

// User search
router.get("/users/search", authMiddleware, searchUsers);

// Conversations
router.get("/conversations", authMiddleware, listConversations);
router.post("/conversations", authMiddleware, startDirect);
router.post("/conversations/group", authMiddleware, createGroup);
router.patch("/conversations/:id", authMiddleware, renameGroup);
router.post("/conversations/:id/admins", authMiddleware, promoteAdmin);
router.post("/conversations/:id/participants", authMiddleware, addParticipants);
router.delete("/conversations/:id/participants/:userId", authMiddleware, removeParticipant);

// Messages
router.get("/conversations/:id/messages", authMiddleware, getMessages);
router.post("/messages", authMiddleware, sendMessage);

export default router;
