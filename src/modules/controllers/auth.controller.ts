import type { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import { signToken } from "../../utils/jwt.js";
import { userService } from "../services/auth.service";
import sendResponse from "../../utils/sendResponse";
import config from "../../config";


const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.body, "req.body");
    const result = await userService.createUserIntoDB(req.body);

    const createdUser = result.rows[0];


    if (createdUser) {
      delete createdUser.password;
    }

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "User registered successfully",
      data: createdUser,
    });
  } catch (error: any) {
    if (error.code === "23505") {
      error.statusCode = 400;
      error.message = "Email already exists. Please use a different email.";
    }
    next(error);
  }
};

const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const result = await userService.loginUserFromDB(email);

    if (result.rows.length === 0) {
      const error: any = new Error("Invalid email or password");
      error.statusCode = 400;
      error.errors = "Authentication failed";
      return next(error);
    }

    const user = result.rows[0];

    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) {
      const error: any = new Error("Invalid email or password");
      error.statusCode = 400; // Bad Request
      error.errors = "Authentication failed";
      return next(error);
    }

    const jwtPayload = {
      id: user.id,
      name: user.name,
      role: user.role,
    };

    const token = signToken({ id: user.id, name: user.name, role: user.role });

    const { password: _, ...userWithoutPassword } = user;

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Login successful",
      data: {
        token,
        user: userWithoutPassword,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

export const userController = {
  createUser,
  loginUser,
};
