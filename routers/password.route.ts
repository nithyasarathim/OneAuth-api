import { Router } from "express";
import limitRate from "../middlewares/rateLimiter";
import {
    verifyPassword, changePassword
} from "../controllers/password.controller";
import authorize from "../middlewares/authenticator";

const passwordRouter = Router();

passwordRouter.post("/verify", limitRate(6), authorize,verifyPassword);
passwordRouter.post("/change", limitRate(3), authorize, changePassword);

export default passwordRouter;