import { Router } from "express";
import limitRate from "../middlewares/rateLimiter";
import { uploadAvatar } from "../controllers/upload.controller";
import authorize from "../middlewares/authenticator";

const uploadRouter = Router();

uploadRouter.post("/avatar", authorize, limitRate(5), uploadAvatar);


export default uploadRouter;
