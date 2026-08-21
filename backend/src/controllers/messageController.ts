import { Response } from "express";
import mongoose from "mongoose";
import { Message } from "../models/Message";
import { Conversation } from "../models/Conversation";
import { AuthRequest } from "../middleware/auth";
import { io } from "../server";

export async function sendMessage(req: AuthRequest, res: Response): Promise<void> {
  const { conversationId, text } = req.body;

  if (!conversationId || !text || !text.trim()) {
    res.status(400).json({
      error: { message: "conversationId and non-empty text are required", code: "VALIDATION_ERROR" },
    });
    return;
  }

  try {
    const conv = await Conversation.findById(conversationId);
    if (!conv) {
      res.status(404).json({
        error: { message: "Conversation not found", code: "NOT_FOUND" },
      });
      return;
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: req.userId,
      text: text.trim(),
    });

    // Update conversation lastMessage
    conv.lastMessage = {
      text: text.trim(),
      sender: new mongoose.Types.ObjectId(req.userId),
      createdAt: message.createdAt,
    };
    await conv.save();

    const populated = await Message.findById(message._id)
      .populate("sender", "_id name phone")
      .lean();

    // Broadcast via Socket.io
    if (io) {
      io.to(`conv:${conversationId}`).emit("message:new", populated);

      // Also notify participants' personal rooms for sidebar updates
      conv.participants.forEach((pId) => {
        io.to(`user:${pId.toString()}`).emit("message:new", populated);
      });
    }

    res.status(201).json(populated);
  } catch (err: any) {
    res.status(500).json({
      error: { message: err.message || "Failed to send message", code: "SERVER_ERROR" },
    });
  }
}

export async function getMessages(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const limit = Math.min(Math.max(parseInt(req.query.limit as string || "20", 10), 1), 100);
  const before = req.query.before as string;

  try {
    const conv = await Conversation.findById(id);
    if (!conv) {
      res.status(404).json({
        error: { message: "Conversation not found", code: "NOT_FOUND" },
      });
      return;
    }

    const query: any = { conversation: id };

    if (before) {
      const beforeMsg = await Message.findById(before);
      if (beforeMsg) {
        query.createdAt = { $lt: beforeMsg.createdAt };
      }
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .populate("sender", "_id name phone")
      .lean();

    const hasMore = messages.length > limit;
    const resultMessages = hasMore ? messages.slice(0, limit) : messages;
    const nextCursor = hasMore && resultMessages.length > 0 ? resultMessages[resultMessages.length - 1]._id : null;

    // Return in chronological order
    resultMessages.reverse();

    res.status(200).json({
      messages: resultMessages,
      nextCursor,
      hasMore,
    });
  } catch (err: any) {
    res.status(500).json({
      error: { message: err.message || "Failed to retrieve messages", code: "SERVER_ERROR" },
    });
  }
}
