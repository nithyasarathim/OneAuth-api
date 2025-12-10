import express from "express";
import errorHandler from "./middlewares/errorHandler";
import requestLogger from "./middlewares/requestLogger";

const app = express();
app.use(express.json());
app.use(requestLogger);
app.use(errorHandler);

export default app;
