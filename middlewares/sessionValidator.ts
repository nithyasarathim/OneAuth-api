import type { Request, Response, NextFunction } from "express";
import { redis } from "../configs/cache";
import ApiError from "../errors/api.error";

const validateSession = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.session_token;
    if (!token) {
      throw new ApiError("Unauthorized", 401);
    }
    const userId = await redis.get(`session:${token}`);
    if (!userId) {
      throw new ApiError("Unauthorized", 401);
    }
    next();
  } catch (err) {
    next(err);
  }
};

export default validateSession;
