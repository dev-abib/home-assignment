import { Server as SocketIOServer, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { Message } from "../models/Message";
import { Conversation } from "../models/Conversation";

const JWT_SECRET = process.env.JWT_SECRET || "pulse_chat_secret_jwt_key_2026_takehome";

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

export function registerSocketHandlers(io: SocketIOServer): void {
  // Authentication middleware for Socket.io
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace("Bearer ", "");

    if (!token) {
      // Allow unauthenticated socket connection or reject
      return next();
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { sub?: string; id?: string; userId?: string };
      socket.userId = decoded.sub || decoded.id || decoded.userId;
      next();
    } catch (err) {
      // Token expired or invalid
      next();
    }
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    const userId = socket.userId;

    if (userId) {
      socket.join(`user:${userId}`);
    }

    // Join a conversation room
    socket.on("conversation:join", (conversationId: string) => {
      if (conversationId) {
        socket.join(`conv:${conversationId}`);
      }
    });

    // Leave a conversation room
    socket.on("conversation:leave", (conversationId: string) => {
      if (conversationId) {
        socket.leave(`conv:${conversationId}`);
      }
    });

    // Handle real-time message sending via socket
    socket.on("message:send", async (data: { conversationId: string; text: string }) => {
      if (!socket.userId || !data.conversationId || !data.text?.trim()) return;

      try {
        const conv = await Conversation.findById(data.conversationId);
        if (!conv) return;

        const message = await Message.create({
          conversation: data.conversationId,
          sender: socket.userId,
          text: data.text.trim(),
        });

        conv.lastMessage = {
          text: data.text.trim(),
          sender: new mongoose.Types.ObjectId(socket.userId),
          createdAt: message.createdAt,
        };
        await conv.save();

        const populated = await Message.findById(message._id)
          .populate("sender", "_id name phone")
          .lean();

        // Broadcast to the conversation room
        io.to(`conv:${data.conversationId}`).emit("message:new", populated);

        // Broadcast to each participant's user room
        conv.participants.forEach((pId) => {
          io.to(`user:${pId.toString()}`).emit("message:new", populated);
        });
      } catch (err) {
        console.error("Error processing socket message:send:", err);
      }
    });

    socket.on("disconnect", () => {
      // Clean up
    });
  });
}
