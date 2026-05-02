import type { Request, Response, NextFunction } from "express";
import crypto from "node:crypto";
import bcrypt from "bcrypt";
import config from "../configs/env";
import ApiError from "../errors/api.error";
import UserAccount from "../modals/UserAccount";
import { sendForgetPasswordEmail } from "../configs/axios/email.axios";
import { redis } from "../configs/cache";

const generateOTP = () => crypto.randomInt(1000, 9999).toString();

const normalizeEmail = (email?: string): string => {
  if (!email) throw new ApiError("Email is required", 400);
  const normalized = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalized)) {
    throw new ApiError("Invalid email format", 400);
  }
  return normalized;
};

const sendOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = normalizeEmail(req.body.email);

    const user = await UserAccount.findOne({ email });
    if (!user) {
      throw new ApiError("No user found", 404);
    }

    const otp = generateOTP();
    const timestamp = Date.now().toString();
    const signature = crypto
      .createHmac("sha256", config.emailServerSecret)
      .update(`${email}:${otp}:${timestamp}`)
      .digest("hex");

    await sendForgetPasswordEmail(email, otp, timestamp, signature);

    await redis.set(`resetpwd:otp:${email}`, otp, { EX: 300 });

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    next(error);
  }
};

const verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { otp } = req.body;

    if (!otp) {
      throw new ApiError("OTP is required", 400);
    }

    const storedOtp = await redis.get(`resetpwd:otp:${email}`);
    if (!storedOtp || storedOtp !== otp) {
      throw new ApiError("Invalid or expired OTP", 400);
    }

    await redis.set(`resetpwd:verified:${email}`, "true", { EX: 300 });
    await redis.del(`resetpwd:otp:${email}`);

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { newPassword } = req.body;

    if (!newPassword) {
      throw new ApiError("New password is required", 400);
    }

    const isVerified = await redis.get(`resetpwd:verified:${email}`);
    if (!isVerified) {
      throw new ApiError("OTP verification required", 403);
    }

    const user = await UserAccount.findOne({ email });
    if (!user) {
      throw new ApiError("No user found", 404);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    await redis.del(`resetpwd:verified:${email}`);

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    next(error);
  }
};

export { sendOtp, verifyOtp, resetPassword };
