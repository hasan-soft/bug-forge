import jwt from "jsonwebtoken";
import type { AuthUser } from "../types/index.js";
import config from "../config/index.js";

export const signToken = (payload: AuthUser): string => {
  return jwt.sign(payload, config.jwt_access_secret as string, {
    expiresIn: "1d",
  });
};

export const verifyToken = (token: string): AuthUser => {
  return jwt.verify(token, config.jwt_access_secret as string) as AuthUser;
};
