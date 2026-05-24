import type { Response } from "express";

type TResponse<T> = {
  statusCode: number;
  success: boolean;
  message?: string;
  data?: T;
};

const sendResponse = <T>(res: Response, payload: TResponse<T>): void => {
  res.status(payload.statusCode).json({
    success: payload.success,
    ...(payload.message && { message: payload.message }),
    ...(payload.data !== undefined && { data: payload.data }),
  });
};

export default sendResponse;
