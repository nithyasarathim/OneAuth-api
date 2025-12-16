import type { Request, Response, NextFunction } from "express";
import { redis } from "../configs/cache";
import UserAccount from "../modals/UserAccount";
import ApiError from "../errors/api.error";

const authorize = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.session_token;
    if (!token) {
      throw new ApiError("Unauthorized", 401);
    }

    const userId = await redis.get(`session:${token}`);
    if (!userId) {
      throw new ApiError("Unauthorized", 401);
    }

    const user = await UserAccount.findById(userId).select("-password");
    if (!user) {
      throw new ApiError("Unauthorized", 401);
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

export default authorize;
