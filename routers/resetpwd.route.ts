import { Router } from "express";
import limitRate from "../middlewares/rateLimiter";
import {
    sendOtp,
    verifyOtp,
    resetPassword
} from "../controllers/resetpwd.controller";


const resetpwdRouter = Router();

resetpwdRouter.post("/otp", limitRate(6), sendOtp);
resetpwdRouter.post("/otp/verify", limitRate(3), verifyOtp);
resetpwdRouter.post("/reset", limitRate(4), resetPassword);

export default resetpwdRouter;