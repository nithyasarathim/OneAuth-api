import type { NextFunction, Request, Response } from "express";
import crypto from "crypto";
import { redis } from "../configs/cache";
import config from "../configs/env";
import ApiError from "../errors/api.error";
import SSOError from "../errors/sso.error";

const AUTH_CODE_TTL = Number(config.AuthTokenTTL);

const allowedClientIds = config.AllowedClientID;
const allowedRedirectUris = config.AllowedRedirectUrl;

const generateAuthCode = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      throw new ApiError("Invalid user token", 401);
    }

    const { client_id, redirect_uri, state } = req.query;

    if (!client_id || !redirect_uri) {
      throw new SSOError("Missing client_id or redirect_uri", 400);
    }

    if (!state) {
      throw new SSOError("Missing state parameter", 400);
    }

    if (!allowedClientIds.includes(client_id as string)) {
      throw new SSOError("Invalid client_id", 400);
    }

    if (!allowedRedirectUris.includes(redirect_uri as string)) {
      throw new SSOError("Invalid redirect_uri", 400);
    }

    const authCode = crypto.randomBytes(32).toString("hex");

    await redis.setEx(
      `auth_code:${authCode}`,
      AUTH_CODE_TTL,
      JSON.stringify({
        userId,
        client_id,
        redirect_uri,
      }),
    );

    res.status(200).json({
      success: true,
      data: {
        auth_code: authCode,
        expires_in: AUTH_CODE_TTL,
        state, 
      },
    });
  } catch (err) {
    next(err);
  }
};


export {
    generateAuthCode
};
