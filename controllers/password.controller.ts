import crypto from "node:crypto";
import bcrypt from "bcrypt";
import UserAccount from "../modals/UserAccount";
import type { Request, Response, NextFunction } from "express";
import { redis } from "../configs/cache";
import ApiError from "../errors/api.error";
import config from "../configs/env";

const verifyPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId;
    const { password } = req.body;
    if (!userId) throw new ApiError("Unauthorized", 401);
    if (!password) throw new ApiError("Password required", 400);
    const user = await UserAccount.findById(userId).select("password");
    if (!user) throw new ApiError("User not found", 404);
    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new ApiError("Incorrect Password", 401);
    const token: string = crypto.randomBytes(32).toString("hex");
    await redis.setEx(`pwd-session:${userId}`, config.verifiedTokenTtl, token);
    res.cookie("pwd-session", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: config.verifiedTokenTtl * 1000,
    });
    res.status(200).json({
      success: true,
      verified: true,
      message: "Password verified. You can now change it.",
    });
  } catch (err) {
    next(err);
  }
};

const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId;
    const { password:newPassword } = req.body;
    const token = req.cookies["pwd-session"];

    if (!userId) throw new ApiError("Unauthorized", 401);
    if (!newPassword) throw new ApiError("New password is required", 400);
    if (!token) throw new ApiError("Password change token missing", 401);
    const storedToken = await redis.get(`pwd-session:${userId}`);
    if (!storedToken || storedToken !== token) {
      throw new ApiError("Invalid or expired token", 401);
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await UserAccount.findByIdAndUpdate(userId, { password: hashedPassword });

    await redis.del(`pwd-session:${userId}`);
    res.clearCookie("pwd-session", {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    });

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (err) {
    next(err);
  }
};

export { verifyPassword, changePassword };
