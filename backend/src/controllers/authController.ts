import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { AuthRequest } from "../middleware/auth";

const JWT_SECRET = process.env.JWT_SECRET || "pulse_chat_secret_jwt_key_2026_takehome";

export async function login(req: Request, res: Response): Promise<void> {
  const { phone, name } = req.body;

  if (!phone || typeof phone !== "string" || !phone.trim()) {
    res.status(400).json({
      error: {
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        details: [{ path: "phone", message: "Phone number is required" }],
      },
    });
    return;
  }

  if (!name || typeof name !== "string" || !name.trim()) {
    res.status(400).json({
      error: {
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        details: [{ path: "name", message: "Name is required" }],
      },
    });
    return;
  }

  const trimmedPhone = phone.trim();
  const trimmedName = name.trim();

  try {
    let user = await User.findOne({ phone: trimmedPhone });

    if (!user) {
      // Auto-register new user
      user = await User.create({
        phone: trimmedPhone,
        name: trimmedName,
      });
    } else {
      // Optionally update name if provided
      if (user.name !== trimmedName) {
        user.name = trimmedName;
        await user.save();
      }
    }

    const token = jwt.sign(
      { sub: user._id.toString(), phone: user.phone },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        createdAt: user.createdAt,
      },
    });
  } catch (err: any) {
    res.status(500).json({
      error: { message: err.message || "Login failed", code: "SERVER_ERROR" },
    });
  }
}

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({
        error: { message: "User not found", code: "NOT_FOUND" },
      });
      return;
    }

    res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        createdAt: user.createdAt,
      },
    });
  } catch (err: any) {
    res.status(500).json({
      error: { message: err.message || "Failed to retrieve user", code: "SERVER_ERROR" },
    });
  }
}
