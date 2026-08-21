import { Response } from "express";
import { User } from "../models/User";
import { AuthRequest } from "../middleware/auth";

export async function searchUsers(req: AuthRequest, res: Response): Promise<void> {
  const query = (req.query.q as string || "").trim();

  if (!query) {
    res.status(200).json([]);
    return;
  }

  try {
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escapedQuery, "i");

    const users = await User.find({
      _id: { $ne: req.userId },
      $or: [{ name: regex }, { phone: regex }],
    })
      .select("_id name phone createdAt")
      .limit(30)
      .lean();

    res.status(200).json(users);
  } catch (err: any) {
    res.status(500).json({
      error: { message: err.message || "Failed to search users", code: "SERVER_ERROR" },
    });
  }
}
