import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";
import type { AuthUser } from "../types/index.js";
import { AppError } from "../types/index.js";

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  try {
    const token = req.headers["authorization"];

    if (!token) {
      return next(new AppError("Access token is required", 401));
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch {
    next(new AppError("Invalid or expired token", 401));
  }
};

export const authorizeRole = (...roles: AuthUser["role"][]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const userRole = req.user?.role;
    if (!userRole || !roles.includes(userRole)) {
      return next(
        new AppError("You do not have permission to perform this action", 403),
      );
    }
    next();
  };
};
