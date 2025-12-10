import { Router } from "express";
import {
  verifyEmail,
  verifyOTP,
  createAccount,
} from "../controllers/register.controller";
import limitRate from "../middlewares/rateLimiter";

const registerRouter = Router();

registerRouter.post("/verify-email", limitRate(3), verifyEmail);
registerRouter.post("/verify-otp", limitRate(3), verifyOTP);
registerRouter.post("/create-account", limitRate(3), createAccount);

export default registerRouter;
