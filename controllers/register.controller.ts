import type { Request, Response, NextFunction } from "express";
import crypto from "node:crypto";
import bcrypt from "bcrypt";
import config from "../configs/env";
import { sendVerificationEmail } from "../configs/axios/email.axios";
import UserAccount from "../modals/UserAccount";
import { redis } from "../configs/cache";
import ApiError from "../errors/api.error";

const OTP_TTL = config.otpTtl;
const VERIFIED_TOKEN_TTL = config.verifiedTokenTtl;

const normalizeEmail = (email?: string): string => {
  if (!email) throw new ApiError("Email is required", 400);
  return email.trim().toLowerCase();
};

const generateOTP = () => crypto.randomInt(1000, 9999).toString();
const generateToken = () => crypto.randomBytes(32).toString("hex");

const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const email = normalizeEmail(req.body.email);

    const existingUser = await UserAccount.findOne({ email });
    if (existingUser) {
      throw new ApiError("Email already in use", 409);
    }

    const otp = generateOTP();
    const timestamp = Date.now().toString();
    const signature = crypto
      .createHmac("sha256", config.emailServerSecret)
      .update(email + otp + timestamp)
      .digest("hex");

    await redis.set(`otp:${email}`, otp, { EX: OTP_TTL });
    await sendVerificationEmail(email, otp, timestamp, signature);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (err) {
    next(err);
  }
};

const verifyOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const email = normalizeEmail(req.body.email);
    const { otp } = req.body;

    if (!otp) {
      throw new ApiError("OTP is required", 400);
    }

    const storedOtp = await redis.get(`otp:${email}`);
    if (!storedOtp) {
      throw new ApiError("OTP expired or not found", 410);
    }

    if (otp !== storedOtp) {
      throw new ApiError("Invalid OTP", 400);
    }

    await redis.del(`otp:${email}`);

    const token = generateToken();
    await redis.set(`verify:${token}`, email, {
      EX: VERIFIED_TOKEN_TTL,
    });

    res.cookie("verified_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: VERIFIED_TOKEN_TTL * 1000,
    });

    res.status(200).json({
      success: true,
      message: "OTP verified",
    });
  } catch (err) {
    next(err);
  }
};

const createAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = req.body.password?.trim();
    const token = req.cookies?.verified_token;

    if (!password) {
      throw new ApiError("Password is required", 400);
    }

    if (!token) {
      throw new ApiError("Email verification required", 401);
    }

    const verifiedEmail = await redis.get(`verify:${token}`);
    if (verifiedEmail !== email) {
      await redis.del(`verify:${token}`);
      throw new ApiError("Email not verified", 401);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const username = email.split("@")[0];

    const user = await UserAccount.create({
      email,
      password: hashedPassword,
      username,
    });

    await redis.del(`verify:${token}`);
    res.clearCookie("verified_token");

    const sessionToken = generateToken();
    await redis.set(`session:${sessionToken}`, user._id.toString(), {
      EX: config.sessionCookieTtl,
    });

    res.cookie("session_token", sessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: config.sessionCookieTtl * 1000,
    });

    res.status(201).json({
      success: true,
      message: "Account created successfully",
    });
  } catch (err) {
    next(err);
  }
};

export { verifyEmail, verifyOTP, createAccount };
