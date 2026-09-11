import type {
  ErrorRequestHandler,
  Request,
  Response,
  NextFunction,
} from "express";
import env from "@configs/env.config.js";
import { AppError } from "@utils/essential.util.js";

export const globalErrorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let error: AppError;

  if (err instanceof AppError) {
    error = err;
  } else {
    error = new AppError(
      "Internal server error",
      500,
      err instanceof Error ? err : undefined,
    );
  }

  console.error(error)

  const response: Record<string, unknown> = {
    success: false,
    status: error.status,
    message: error.message,
  };

  if (env.NODE_ENV !== "production") {
    response.error = {
      name: error.name,
      statusCode: error.statusCode,
      stack: error.stack,
      cause: error.cause,
    };
  }

  res.status(error.statusCode).json(response);
};
