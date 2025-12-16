import { Router } from "express";

import { login, logout } from "../controllers/login.controller";

import limitRate from "../middlewares/rateLimiter";
import authorize from "../middlewares/authenticator";
import validateSession from "../middlewares/sessionValidator";

const SessionRouter = Router();

SessionRouter.post("/login", limitRate(8), login);
SessionRouter.post("/logout", limitRate(5), authorize, logout);
SessionRouter.get("/validate", validateSession, (req, res) => {
    res.status(200).json({
        success: true,
        authenticated:true
    })
});

export default SessionRouter;
