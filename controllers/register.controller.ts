import type { Request, Response } from "express";
import crypto from "node:crypto";
import bcrypt from "bcrypt";
import config from "../configs/env";
import { sendVerificationEmail } from "../configs/axios/email.axios";
import UserAccount from "../modals/UserAccount";
import { redis } from "../configs/cache";

const OTP_TTL = config.otpTtl;
const VERIFIED_TOKEN_TTL = config.verifiedTokenTtl;

const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const email = req.body.email?.trim().toLowerCase();

    const existingUser = await UserAccount.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: "Email already in use !",
      });
      return;
    }

    const otp = crypto.randomInt(1000, 9999).toString();
    const timestamp = Date.now().toString();
    const signature = crypto
      .createHmac("sha256", config.emailServerSecret)
      .update(email + otp + timestamp)
      .digest("hex");

    await redis.set(`otp:${email}`, otp, { EX: OTP_TTL });
    await sendVerificationEmail(email, otp, timestamp, signature);

    res.status(200).json({
      success: true,
      message: "OTP Sent successfully",
    });
  } catch (err) {
    console.log("ERROR VERIFYING EMAIL :", err);
    res.status(500).json({
      success: false,
      message: "Error in sending OTP",
    });
  }
};

const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const { otp } = req.body;
    console.log(email);
    if (!email || !otp) {
      console.log("Email and OTP required");
      res.status(500).json({
        success: false,
        message: "Email and OTP required",
      });
      return;
    }
    const storedOtp = await redis.get(`otp:${email}`);
    if (!storedOtp) {
      console.log("OTP not found");
      res.status(400).json({
        success: false,
        message: "OTP not found or expired",
      });
      return;
    }

    if (otp !== storedOtp) {
      res.status(400).json({
        success: false,
        message: "Invalid One-time password",
      });
      return;
    }

    await redis.del(`otp:${email}`);
    const token = crypto.randomBytes(32).toString("hex");

    await redis.set(`verify:${token}`, email, { EX: VERIFIED_TOKEN_TTL });

    res.cookie("verified_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: VERIFIED_TOKEN_TTL * 1000,
    });

    console.log(res.cookie.verified_token);

    res.status(200).json({
      success: true,
      message: "OTP is valid",
    });
    return;
  } catch (err) {
    console.log("Internal server error");
    res.status(500).json({
      success: false,
      message: "Internal server Error",
    });
    console.log("[OTP VALIDATION ERROR] " + err.stack);
  }
};

const createAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const { password } = req.body;

    const token = req.cookies?.verified_token;
    if (!token) {
      res.status(400).json({
        success: false,
        message: "Unauthorized request",
      });
      return;
    }
    const sessionEmail = await redis.get(`verify:${token}`);

    if (!sessionEmail || sessionEmail !== email) {
      res.status(400).json({
        success: false,
        message: "Email is not verified",
      });
      redis.del(`verify:${token}`);
      return;
    }
    const username = email.split("@")[0];

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = await bcrypt.hash(password.trim(), 10);

    const user = await UserAccount.create({
      email: normalizedEmail,
      password: normalizedPassword,
      username,
    });
    redis.del(`verify:${token}`);
    res.clearCookie("verified_token");

    const sessionToken = crypto.randomBytes(32).toString("hex");

    await redis.set(`session:${sessionToken}`, user._id.toString(), {
      EX: config.sessionCookieTtl,
    });

    res.cookie("session_token", sessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: config.sessionCookieTtl,
    });

    res.status(200).json({
      success: true,
      message: "User Created",
    });
  } catch (err: unknown) {
    console.log("[ERROR IN CREATING ACCOUNT] : ", err);
    res.status(500).json({
      success: false,
      message: "Error in creating account",
    });
  }
};

export { verifyEmail, verifyOTP, createAccount };
