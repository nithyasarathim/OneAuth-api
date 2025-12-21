import { Router } from "express";
import limitRate from "../middlewares/rateLimiter";
import { removeAvatar, uploadAvatar } from "../controllers/avatar.controller";
import authorize from "../middlewares/authenticator";

const avatarRouter = Router();

avatarRouter.post("/upload", authorize, limitRate(2), uploadAvatar);
avatarRouter.delete("/remove", authorize, limitRate(2), removeAvatar);

export default avatarRouter;
