import type { ErrorRequestHandler } from "express";
import { AppError } from "../types/index.js";

const globalErrorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message =
    err instanceof AppError ? err.message : "Something went wrong!";
  const errors = err instanceof AppError ? err.errors : "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

export default globalErrorHandler;
