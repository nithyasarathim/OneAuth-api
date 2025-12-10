import { Router } from "express";
import {
  verifyEmail,
  verifyOTP,
  createAccount,
} from "../controllers/register.controller";
import limitRate from "../middlewares/rateLimiter";

const registerRouter = Router();

registerRouter.post("/verify-email", limitRate(2), verifyEmail);
registerRouter.post("/verify-otp", limitRate(2), verifyOTP);
registerRouter.post("/create-account", limitRate(2), createAccount);

export default registerRouter;
