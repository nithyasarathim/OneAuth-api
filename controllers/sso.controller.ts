import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { redis } from "../configs/cache";
import config from "../configs/env";
import ApiError from "../errors/api.error";
import SSOError from "../errors/sso.error";
import UserAccount from "../modals/UserAccount";
import validateClientSecret from "../utils/validateClientSecret";

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
    const { client_id, redirect_uri, state } = req.query as {
      client_id?: string;
      redirect_uri?: string;
      state?: string;
    };
    if (!client_id || !redirect_uri) {
      throw new SSOError("Missing client_id or redirect_uri", 400);
    }
    if (!state) {
      throw new SSOError("Missing state parameter", 400);
    }
    if (!allowedClientIds.includes(client_id)) {
      throw new SSOError("Invalid client_id", 400);
    }
    if (!allowedRedirectUris.includes(redirect_uri)) {
      throw new SSOError("Invalid redirect_uri", 400);
    }

    const authCode = crypto.randomBytes(32).toString("hex");
    await redis.setEx(
      `auth_code:${authCode}`,
      AUTH_CODE_TTL,
      JSON.stringify({ userId, client_id, redirect_uri }),
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

const generateToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { auth_code, client_id, client_secret, redirect_uri, grant_type } =
      req.body;

    if (grant_type !== "authorization_code") {
      throw new SSOError("Invalid grant_type", 400);
    }

    if (!auth_code || !client_id || !client_secret || !redirect_uri) {
      throw new SSOError("Missing required parameters", 400);
    }

    if (!allowedClientIds.includes(client_id)) {
      throw new SSOError("Invalid client_id", 401);
    }

    const validSecret = await validateClientSecret(client_id, client_secret);
    if (!validSecret) {
      throw new SSOError("Invalid client_secret", 401);
    }

    const key = `auth_code:${auth_code}`;
    const stored = await redis.get(key);

    if (!stored) {
      throw new SSOError("Invalid or expired authorization code", 400);
    }

    const parsed = JSON.parse(stored) as {
      userId: string;
      client_id: string;
      redirect_uri: string;
    };

    if (parsed.client_id !== client_id) {
      throw new SSOError("client_id mismatch", 400);
    }

    if (parsed.redirect_uri !== redirect_uri) {
      throw new SSOError("redirect_uri mismatch", 400);
    }

    await redis.del(key);

    const accessToken = jwt.sign(
      {
        sub: parsed.userId,
        client_id,
        type: "access_token",
      },
      config.JwtSecret,
      {
        expiresIn: config.AccessTokenTTL,
        issuer: "one-auth",
        audience: client_id,
      },
    );

    res.status(200).json({
      access_token: accessToken,
      token_type: "Bearer",
      expires_in: Number(config.AccessTokenTTL),
    });
  } catch (err) {
    next(err);
  }
};

const fetchUserInfo = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError("Missing or invalid Authorization header", 401);
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, config.JwtSecret) as {
      sub: string;
      client_id: string;
      type: string;
      iat: number;
      exp: number;
    };

    if (decoded.type !== "access_token") {
      throw new ApiError("Invalid token type", 401);
    }

    const user = await UserAccount.findById(decoded.sub).select("_id email username department role skills description isAvailable");
    if (!user) {
      throw new ApiError("User not exists", 404);
    }

    res.status(200).json({
      success: true,
      data: {
        user_id: decoded.sub,
        user: user,
        client_id: decoded.client_id,
        issued_at: decoded.iat,
        expires_at: decoded.exp,
      },
    });
  } catch (err) {
    next(err);
  }
};

export { generateAuthCode, generateToken, fetchUserInfo };
