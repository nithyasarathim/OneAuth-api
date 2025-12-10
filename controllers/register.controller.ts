import type { Request, Response } from "express";

const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  // will be defined then.
  res.status(200).json({ success: true, message: `OTP sent` });
};

const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  //will be defined then.
  res.status(200).json({ success: true, message: `OTP is valid` });
};

const createAccount = async (req: Request, res: Response): Promise<void> => {
  //business logic will be defined then.
  res
    .status(200)
    .json({ success: true, message: `Account created successfully` });
};

export { verifyEmail, verifyOTP, createAccount };
