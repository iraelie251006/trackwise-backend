import { NextFunction, Request, Response } from "express";

interface ReqResNextObject {
  req: Request,
  res: Response,
  next: NextFunction,
}
type ActionResponse<T = null> = {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details?: Record<string, string[]>;
  };
  status?: number;
};

type SuccessResponse<T = null> = ActionResponse<T> & { success: true };
type ErrorResponse = ActionResponse<undefined> & { success: false };

type APIErrorResponse = Response<ErrorResponse>;
type APIResponse<T = null> = Response<SuccessResponse<T> | ErrorResponse>;
