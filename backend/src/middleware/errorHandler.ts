import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/index.ts";
import { config } from "../config/index.ts";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.name,
      message: err.message,
    });
    return;
  }

  console.error("Unhandled error:", err);

  res.status(500).json({
    error: "InternalServerError",
    message: config.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
}
