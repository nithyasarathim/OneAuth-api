import type { Request, Response } from "express";
import crypto from "crypto";
import config from "../configs/env";
import { sendVerificationEmail } from "../configs/axios/email.axios";
import OTPStore from "../utils/OtpMap";
import OtpMap from "../utils/OtpMap";

const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const otp = crypto.randomInt(1000,9999).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    OtpMap.set(email, { otp, expiresAt });
    const timestamp = Date.now().toString();
    const rawInfo = email + otp + timestamp;
    const signature = crypto
      .createHmac("sha256", config.emailServerSecret)
      .update(rawInfo)
      .digest("hex");

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
  const { email, otp } = req.body;
  console.log(email, otp);
  res.status(200).json({ success: true, message: `OTP is valid` });
};

const createAccount = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  console.log(email, password);
  res
    .status(200)
    .json({ success: true, message: `Account created successfully` });
};

export { verifyEmail, verifyOTP, createAccount };
