import mongoose from "mongoose";
import { ApiError } from "../utils/apiError.js";
import { env } from "../config/env.js";

export const notFound = (req, _res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
};

export const errorHandler = (err, _req, res, _next) => {
  let error = err;

  if (err instanceof mongoose.Error.ValidationError) {
    error = new ApiError(400, "Validation failed", err.errors);
  }

  if (err instanceof mongoose.Error.CastError) {
    error = new ApiError(400, "Invalid resource identifier");
  }

  if (err?.code === 11000) {
    error = new ApiError(409, "Duplicate value already exists", err.keyValue);
  }

  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: error.isOperational ? error.message : "Internal server error",
    ...(error.details ? { details: error.details } : {}),
    ...(env.nodeEnv === "development" ? { stack: err.stack } : {})
  });
};
