import EnvError from "../errors/env.error";
import type { Request, Response, NextFunction } from "express";

const errorHandler = function (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof EnvError) {
    console.log(`[ENV ERROR] : ${err.message}`);
    return res.status(err.statusCode).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

export default errorHandler;
