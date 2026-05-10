import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/apiError.js";

export const authenticate = async (req, _res, next) => {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.split(" ")[1] : null;

    if (!token) throw new ApiError(401, "Authentication required");

    const payload = jwt.verify(token, env.jwtAccessSecret);
    const user = await User.findById(payload.sub).select("-password -refreshTokens");

    if (!user || !user.isActive) throw new ApiError(401, "Invalid authentication session");

    req.user = user;
    next();
  } catch (error) {
    next(error instanceof ApiError ? error : new ApiError(401, "Invalid or expired token"));
  }
};

export const authorize = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new ApiError(403, "You do not have permission to perform this action"));
  }
  next();
};
