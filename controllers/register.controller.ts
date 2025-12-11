import type { Request, Response } from "express";

const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  console.log(email);
  res.status(200).json({ success: true, message: `OTP sent` });
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
