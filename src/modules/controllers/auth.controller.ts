import type { Request, Response } from "express";
import { userService } from "../services/auth.service";
import sendResponse from "../../utils/sendResponse";

const createUser = async (req: Request, res: Response) => {
  try {
    console.log(req.body, "req.body");
    const result = await userService.createUserIntoDB(req.body);
    
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "User registered successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    if (error.code === "23505") {
      res.status(400).json({
        success: false,
        message: "Email already exists. Please use a different email.",
        errors: error.message,
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
      errors: error,
    });
  }
};

export const userController = {
  createUser,
};