import type { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import { StatusCodes } from "http-status-codes";
import { signToken } from "../../utils/jwt.js";
import { userService } from "../services/auth.service.js";
import sendResponse from "../../utils/sendResponse.js";
import { AppError } from "../../types/index.js";

const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await userService.createUserIntoDB(req.body);
    const createdUser = result.rows[0];

    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: "User registered successfully",
      data: {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        role: createdUser.role,
        created_at: createdUser.created_at,
        updated_at: createdUser.updated_at,
      },
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as any).code === "23505"
    ) {
      return next(
        new AppError(
          "Email already exists. Please use a different email.",
          StatusCodes.BAD_REQUEST,
        ),
      );
    }
    next(error);
  }
};

const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const result = await userService.loginUserFromDB(email);

    if (result.rows.length === 0) {
      return next(
        new AppError("Invalid email or password", StatusCodes.BAD_REQUEST),
      );
    }

    const user = result.rows[0];
    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) {
      return next(
        new AppError("Invalid email or password", StatusCodes.BAD_REQUEST),
      );
    }

    const token = signToken({ id: user.id, name: user.name, role: user.role });

  
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          created_at: user.created_at,
          updated_at: user.updated_at,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const userController = {
  createUser,
  loginUser,
};
