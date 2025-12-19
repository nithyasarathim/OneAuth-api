import { Router } from "express";
import limitRate from "../middlewares/rateLimiter";
import { fetchPersonalData } from "../controllers/user.controller";

const userRouter = Router();

userRouter.get("/me", limitRate(60), fetchPersonalData);

export default userRouter;
