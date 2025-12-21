import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";

import errorHandler from "./middlewares/errorHandler";
import requestLogger from "./middlewares/requestLogger";
import registerRouter from "./routers/register.route";
import sessionRouter from "./routers/login.route";
import userRouter from "./routers/user.route";
import config from "./configs/env";
import avatarRouter from "./routers/avatar.route";

const app = express();

app.use(
  cors({
    origin: config.clientDomainUrl,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);

app.use("/auth/register", registerRouter);
app.use("/auth/session", sessionRouter);
app.use("/users", userRouter);
app.use("/avatar", avatarRouter);

app.use(errorHandler);

export default app;
