import { Router } from "express";

import { login, logout } from "../controllers/login.controller";

import limitRate from "../middlewares/rateLimiter";

const loginRouter = Router();

loginRouter.post("/", limitRate(2), login);

export default loginRouter;
