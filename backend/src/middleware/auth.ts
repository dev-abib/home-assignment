import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "pulse_chat_secret_jwt_key_2026_takehome";

export interface AuthRequest extends Request {
  userId?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      error: {
        message: "Unauthorized: Missing or invalid Authorization header",
        code: "UNAUTHORIZED",
      },
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { sub?: string; id?: string; userId?: string };
    const uid = decoded.sub || decoded.id || decoded.userId;

    if (!uid) {
      res.status(401).json({
        error: { message: "Invalid token payload", code: "UNAUTHORIZED" },
      });
      return;
    }

    req.userId = uid;
    next();
  } catch (err) {
    res.status(401).json({
      error: { message: "Token expired or invalid", code: "UNAUTHORIZED" },
    });
  }
}
