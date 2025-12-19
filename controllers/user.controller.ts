import type { NextFunction, Request, Response } from 'express';
import UserAccount from '../modals/UserAccount';
import ApiError from '../errors/api.error';
import { redis } from '../configs/cache';

const fetchPersonalData = async (req: Request, res: Response, next:NextFunction): Promise<void> => {
    try {
        const sessionToken = req.cookies?.session_token;
        if (!sessionToken) {
            throw new ApiError("Session is not established", 401);
        }
        const userId = await redis.get(`session:${sessionToken}`);
        if (!userId) {
            redis.del(`session:${sessionToken}`);
            throw new ApiError("Invalid or expired session", 401);
        }
        const user = await UserAccount.findById(userId).select("-password");
        if (!user) {
            redis.del(`session:${sessionToken}`);
            throw new ApiError("Invalid user token", 401);
        }
        res.status(200).json({
            success: true,
            user,
        });
        return;
    } catch (err) {
        next(err);
    }
}

export {
    fetchPersonalData
}