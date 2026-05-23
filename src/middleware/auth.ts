import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";
import type { AuthUser } from "../types/index.js";

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  try {
    const token = req.headers["authorization"];

    if (!token) {
      const error: any = new Error("Access token is required");
      error.statusCode = 401;
      return next(error);
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch {
    const error: any = new Error("Invalid or expired token");
    error.statusCode = 401;
    next(error);
  }
};

export const authorizeRole = (...roles: AuthUser["role"][]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const userRole = req.user?.role;
    if (!userRole || !roles.includes(userRole)) {
      const error: any = new Error(
        "You do not have permission to perform this action",
      );
      error.statusCode = 403;
      return next(error);
    }
    next();
  };
};
