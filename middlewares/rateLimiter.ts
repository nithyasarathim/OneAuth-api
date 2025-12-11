import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import config from "../configs/env";
import ApiError from "../errors/api.error";

const WINDOW_MS = config.windowMs;

const limitRate = function (MAX_REQUESTS: number) {
  return rateLimit({
    windowMs: WINDOW_MS,
    max: MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      const ip = ipKeyGenerator(req) as string;
      const path = req.originalUrl;
      return `${ip}-${path}`;
    },
    handler: () => {
      throw new ApiError("Request limit reached. Try shortly", 429);
    },
  });
};

export default limitRate;
