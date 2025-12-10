import express from "express";
import errorHandler from "./middlewares/errorHandler";
import requestLogger from "./middlewares/requestLogger";

import registerRouter from "./routers/register.route";

const app = express();
app.use(express.json());
app.use(requestLogger);

app.use('/auth', registerRouter);

app.use(errorHandler);


export default app;
