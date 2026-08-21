import { Response } from "express";
import mongoose from "mongoose";
import { Conversation } from "../models/Conversation";
import { User } from "../models/User";
import { AuthRequest } from "../middleware/auth";
import { io } from "../server";

export async function listConversations(req: AuthRequest, res: Response): Promise<void> {
  try {
    const conversations = await Conversation.find({
      participants: req.userId,
    })
      .populate("participants", "_id name phone")
      .populate("admins", "_id name phone")
      .populate("createdBy", "_id name phone")
      .populate("lastMessage.sender", "_id name phone")
      .sort({ updatedAt: -1 })
      .lean();

    res.status(200).json(conversations);
  } catch (err: any) {
    res.status(500).json({
      error: { message: err.message || "Failed to list conversations", code: "SERVER_ERROR" },
    });
  }
}

export async function startDirect(req: AuthRequest, res: Response): Promise<void> {
  const { userId } = req.body;

  if (!userId) {
    res.status(400).json({
      error: { message: "userId is required", code: "VALIDATION_ERROR" },
    });
    return;
  }

  if (userId === req.userId) {
    res.status(400).json({
      error: { message: "Cannot start a direct conversation with yourself", code: "VALIDATION_ERROR" },
    });
    return;
  }

  try {
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      res.status(404).json({
        error: { message: "Target user not found", code: "NOT_FOUND" },
      });
      return;
    }

    // Check if direct conversation already exists
    let conv = await Conversation.findOne({
      type: "direct",
      participants: { $all: [req.userId, userId], $size: 2 },
    })
      .populate("participants", "_id name phone")
      .populate("admins", "_id name phone")
      .populate("createdBy", "_id name phone");

    if (!conv) {
      conv = await Conversation.create({
        type: "direct",
        participants: [req.userId, userId],
        admins: [req.userId],
        createdBy: req.userId,
      });

      conv = await Conversation.findById(conv._id)
        .populate("participants", "_id name phone")
        .populate("admins", "_id name phone")
        .populate("createdBy", "_id name phone");
    }

    res.status(200).json(conv);
  } catch (err: any) {
    res.status(500).json({
      error: { message: err.message || "Failed to start conversation", code: "SERVER_ERROR" },
    });
  }
}

export async function createGroup(req: AuthRequest, res: Response): Promise<void> {
  const { name, participantIds } = req.body;

  if (!name || typeof name !== "string" || !name.trim()) {
    res.status(400).json({
      error: { message: "Group name is required", code: "VALIDATION_ERROR" },
    });
    return;
  }

  if (!Array.isArray(participantIds) || participantIds.length < 2) {
    res.status(400).json({
      error: {
        message: "Validation failed: a group needs at least 3 members",
        code: "VALIDATION_ERROR",
      },
    });
    return;
  }

  try {
    const allMemberIds = Array.from(new Set([req.userId!, ...participantIds]));

    if (allMemberIds.length < 3) {
      res.status(400).json({
        error: {
          message: "Validation failed: a group needs at least 3 members",
          code: "VALIDATION_ERROR",
        },
      });
      return;
    }

    const group = await Conversation.create({
      type: "group",
      name: name.trim(),
      createdBy: req.userId,
      admins: [req.userId],
      participants: allMemberIds,
    });

    const populated = await Conversation.findById(group._id)
      .populate("participants", "_id name phone")
      .populate("admins", "_id name phone")
      .populate("createdBy", "_id name phone");

    // Emit socket event to all members
    if (io) {
      allMemberIds.forEach((mId) => {
        io.to(`user:${mId}`).emit("conversation:updated", populated);
      });
    }

    res.status(201).json(populated);
  } catch (err: any) {
    res.status(500).json({
      error: { message: err.message || "Failed to create group", code: "SERVER_ERROR" },
    });
  }
}

export async function renameGroup(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const { name } = req.body;

  if (!name || !name.trim()) {
    res.status(400).json({
      error: { message: "Group name is required", code: "VALIDATION_ERROR" },
    });
    return;
  }

  try {
    const conv = await Conversation.findById(id);
    if (!conv) {
      res.status(404).json({
        error: { message: "Conversation not found", code: "NOT_FOUND" },
      });
      return;
    }

    conv.name = name.trim();
    await conv.save();

    const updated = await Conversation.findById(id)
      .populate("participants", "_id name phone")
      .populate("admins", "_id name phone")
      .populate("createdBy", "_id name phone");

    if (io) {
      io.to(`conv:${id}`).emit("conversation:updated", updated);
    }

    res.status(200).json(updated);
  } catch (err: any) {
    res.status(500).json({
      error: { message: err.message || "Failed to rename group", code: "SERVER_ERROR" },
    });
  }
}

export async function promoteAdmin(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const { userId } = req.body;

  if (!userId) {
    res.status(400).json({
      error: { message: "userId is required", code: "VALIDATION_ERROR" },
    });
    return;
  }

  try {
    const conv = await Conversation.findById(id);
    if (!conv) {
      res.status(404).json({
        error: { message: "Conversation not found", code: "NOT_FOUND" },
      });
      return;
    }

    const uid = new mongoose.Types.ObjectId(userId);
    if (!conv.admins.some((a) => a.toString() === userId)) {
      conv.admins.push(uid);
      await conv.save();
    }

    const updated = await Conversation.findById(id)
      .populate("participants", "_id name phone")
      .populate("admins", "_id name phone")
      .populate("createdBy", "_id name phone");

    if (io) {
      io.to(`conv:${id}`).emit("conversation:updated", updated);
    }

    res.status(200).json(updated);
  } catch (err: any) {
    res.status(500).json({
      error: { message: err.message || "Failed to promote admin", code: "SERVER_ERROR" },
    });
  }
}

export async function addParticipants(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const { userIds } = req.body;

  if (!Array.isArray(userIds) || userIds.length === 0) {
    res.status(400).json({
      error: { message: "userIds array is required", code: "VALIDATION_ERROR" },
    });
    return;
  }

  try {
    const conv = await Conversation.findById(id);
    if (!conv) {
      res.status(404).json({
        error: { message: "Conversation not found", code: "NOT_FOUND" },
      });
      return;
    }

    userIds.forEach((uId) => {
      if (!conv.participants.some((p) => p.toString() === uId)) {
        conv.participants.push(new mongoose.Types.ObjectId(uId));
      }
    });

    await conv.save();

    const updated = await Conversation.findById(id)
      .populate("participants", "_id name phone")
      .populate("admins", "_id name phone")
      .populate("createdBy", "_id name phone");

    if (io) {
      io.to(`conv:${id}`).emit("conversation:updated", updated);
    }

    res.status(200).json(updated);
  } catch (err: any) {
    res.status(500).json({
      error: { message: err.message || "Failed to add participants", code: "SERVER_ERROR" },
    });
  }
}

export async function removeParticipant(req: AuthRequest, res: Response): Promise<void> {
  const { id, userId } = req.params;

  try {
    const conv = await Conversation.findById(id);
    if (!conv) {
      res.status(404).json({
        error: { message: "Conversation not found", code: "NOT_FOUND" },
      });
      return;
    }

    conv.participants = conv.participants.filter((p) => p.toString() !== userId);
    conv.admins = conv.admins.filter((a) => a.toString() !== userId);
    await conv.save();

    const updated = await Conversation.findById(id)
      .populate("participants", "_id name phone")
      .populate("admins", "_id name phone")
      .populate("createdBy", "_id name phone");

    if (io) {
      io.to(`conv:${id}`).emit("conversation:updated", updated);
    }

    res.status(200).json(updated);
  } catch (err: any) {
    res.status(500).json({
      error: { message: err.message || "Failed to remove participant", code: "SERVER_ERROR" },
    });
  }
}
