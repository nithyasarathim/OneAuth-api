import type { Request, Response } from "express";
import crypto from "node:crypto";
import bcrypt from "bcrypt";

import config from "../configs/env";
import UserAccount from "../modals/UserAccount";
import { redis } from "../configs/cache";

const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const email = req.body.email.trim().toLowerCase();
        const { password } = req.body;

        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: "Fields shouldn't be empty !"
            });
            return;
        }
        const user = await UserAccount.findOne({ email });
        if (!user) {
            res.status(401).json({
                success: false,
                message: "User Not found",
            })
            return;
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({
                success: false,
                message: "Invalid password",
            });
            return;
        }
        const sessionToken = crypto.randomBytes(32).toString("hex");
        await redis.set(`session:${sessionToken}`, user._id.toString(), {
            EX: config.sessionCookieTtl,
        });

        res.cookie("session_token", sessionToken, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            maxAge: config.sessionCookieTtl * 1000,
        });
    } catch (err) {
        console.log("[LOGIN ERROR] :", err);
        res.status(500).json({
            success: false,
            message: "Error during login"
        });
    }
};


export {
    login
}