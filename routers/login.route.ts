import { Router } from "express";

import { login, logout } from "../controllers/login.controller";

import limitRate from "../middlewares/rateLimiter";
import authorize from "../middlewares/authenticator";

const SessionRouter = Router();

SessionRouter.post("/login", limitRate(8), login);
SessionRouter.post("/logout", limitRate(5), authorize, logout);

export default SessionRouter;
