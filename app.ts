import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";

import errorHandler from "./middlewares/errorHandler";
import requestLogger from "./middlewares/requestLogger";
import registerRouter from "./routers/register.route";


const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);

app.use("/auth/register", registerRouter);

app.use(errorHandler);

export default app;
