import { Router } from "express";
import limitRate from "../middlewares/rateLimiter";
import { generateAuthCode } from "../controllers/sso.controller";

const ssoRouter = Router();

ssoRouter.post("/authorize", limitRate(2), generateAuthCode);

export default ssoRouter;