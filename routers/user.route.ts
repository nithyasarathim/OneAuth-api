import { Router } from "express";
import limitRate from "../middlewares/rateLimiter";
import { fetchPersonalData, updatePersonalData } from "../controllers/user.controller";
import authorize from "../middlewares/authenticator";

const userRouter = Router();

userRouter.get("/me", limitRate(60), authorize, fetchPersonalData);
userRouter.patch("/me", limitRate(10), authorize, updatePersonalData);

export default userRouter;
