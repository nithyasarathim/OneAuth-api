import EnvError from "../errors/env.error";
import ApiError from "../errors/api.error";
import type { Request, Response, NextFunction } from "express";

const errorHandler = function (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof EnvError) {
    console.error(`[ENV ERROR] : ${err.message}`);
    return res.status(err.statusCode).json({
      message: "Internal Server Error",
      success: false,
    });
  }
  if (err instanceof ApiError) {
    console.warn(`[API ERROR] : ${err.message}`);
    return res.status(err.statusCode).json({
      message: err.message,
      success: false,
    });
  }
  console.log(`[UNHANDLED SERVER ERROR] : ${err.message}`);
  console.log(err.stack);
  return res.status(500).json({
    message: "Internal Server Error",
    success: false,
  });
};

export default errorHandler;
