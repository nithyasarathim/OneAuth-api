import { Router } from "express";
import limitRate from "../middlewares/rateLimiter";
import { generateAuthCode, generateToken,fetchUserInfo } from "../controllers/sso.controller";
import authorize from "../middlewares/authenticator";

const ssoRouter = Router();

ssoRouter.get("/authorize", limitRate(20), authorize, generateAuthCode);
ssoRouter.post("/token", limitRate(20), generateToken);
ssoRouter.get("/userinfo", limitRate(30), fetchUserInfo);

export default ssoRouter; 
