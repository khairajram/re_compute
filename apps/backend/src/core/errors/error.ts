import { Request, Response, NextFunction } from "express";
import { logger } from "../logger/logger.js";


export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode = 500) {
    super(message);

    this.statusCode = statusCode;
    this.isOperational = statusCode < 500;

    Error.captureStackTrace(this, this.constructor);
  }
}


const handleKnownErrors = (err: any): AppError => {
  
  if (err.name === "JsonWebTokenError") {
    return new AppError("Invalid token", 401);
  }

  if (err.name === "TokenExpiredError") {
    return new AppError("Token expired", 401);
  }


  if (err.code === "P2002") {
    return new AppError("Duplicate field value", 400);
  }

  return err;
};


export const globalErrorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error: AppError;

  if (err instanceof AppError) {
    error = err;
  } else {
    const processed = handleKnownErrors(err);
    error =
      processed instanceof AppError
        ? processed
        : new AppError((err as any)?.message || "Internal Server Error", 500);
  }

  logger.error({
    message: error.message,
    statusCode: error.statusCode,
    stack: error.stack,
    path: req.originalUrl,
    method: req.method,
  });

  if (process.env.NODE_ENV === "development") {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      stack: error.stack,
    });
  }

  return res.status(error.statusCode).json({
    success: false,
    message: error.isOperational
      ? error.message
      : "Something went wrong. Please try again later.",
  });
};