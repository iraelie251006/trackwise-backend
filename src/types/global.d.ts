import { NextFunction, Request, Response } from "express";

interface ReqResNextObject {
  req: Request,
  res: Response,
  next: NextFunction,
}

type SuccessResponse<T = null> = ActionResponse<T> & { success: true };
type ErrorResponse = ActionResponse<undefined> & { success: false };

type APIErrorResponse = Response<ErrorResponse>;
type APIResponse<T = null> = Response<SuccessResponse<T> | ErrorResponse>;
