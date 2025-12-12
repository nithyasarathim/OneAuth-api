import type { Request, Response } from "express";
import crypto from "node:crypto";
import bcrypt from "bcrypt";
import config from "../configs/env";
import { sendVerificationEmail } from "../configs/axios/email.axios";
import OtpMap from "../utils/OtpMap";
import VerifiedSessionMap from "../utils/verifiedSessionMap";
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
    const record = OtpMap.get(email);
    if (!record) {
      console.log("OTP not found");
      res.status(400).json({
        success: false,
        message: "OTP not found or expired",
      });
      return;
    }
    const { otp: storedOtp, expiresAt } = record;
    if (Date.now() > expiresAt) {
      console.log("OTP has expired");
      OtpMap.delete(email);
      res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
      return;
    }

    if (otp !== storedOtp) {
      console.log("Invalid OTP");
      res.status(400).json({
        success: false,
        message: "Invalid One-time password",
      });
      return;
    }
    OtpMap.delete(email);
    const token = crypto.randomBytes(32).toString("hex");
    const tokenExpiresAt = Date.now() + 5 * 60 * 1000;

    VerifiedSessionMap.set(token, { email, expiresAt: tokenExpiresAt });
    res.cookie("verified_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 5 * 60 * 1000,
    });
    res.status(200).json({
      success: true,
      message: "OTP is valid",
    });
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
    const session = VerifiedSessionMap.get(token);
    if (!session || session.email !== email || Date.now() > session.expiresAt) {
      res.status(400).json({
        success: false,
        message: "Email is not verified",
      });
      VerifiedSessionMap.delete(token);
      return;
    }
    const username = email.split("@")[0];

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = bcrypt.hash(password.trim().toLowerCase(), 10);

    await UserAccount.create({
      email: normalizedEmail,
      password: normalizedPassword,
      username,
    });
    VerifiedSessionMap.delete(token);
    res.clearCookie("verified_token");
    res.status(200).json({
      success: true,
      message: "User Created",
    });
  } catch (err) {
    console.log("[ERROR IN CREATING ACCOUNT] : ", err.message);
    res.status(500).json({
      success: false,
      message: "Error in creating account",
    });
  }
};

export { verifyEmail, verifyOTP, createAccount };
