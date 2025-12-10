import type { Request, Response } from "express";

const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  // will be defined then.
  res.status(200).json({ success: true, message: `OTP sent to ${email}` });
};

const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  const { email, otp } = req.body;
  //will be defined then.
  res.status(200).json({ success: true, message: `OTP is valid` });
};

const createAccount = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  //business logic will be defined then.
  res
    .status(200)
    .json({ success: true, message: `Account created successfully` });
};

export { verifyEmail, verifyOTP, createAccount };
