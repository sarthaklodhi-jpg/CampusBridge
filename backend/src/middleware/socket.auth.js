import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { env } from "../config/env.js";

export const authenticateSocket = async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace("Bearer ", "");

    if (!token) return next(new Error("Authentication required"));

    const payload = jwt.verify(token, env.jwtAccessSecret);
    const user = await User.findById(payload.sub)
      .select("_id name username profilePicture college role isActive")
      .lean();

    if (!user || !user.isActive) return next(new Error("Invalid authentication session"));

    socket.user = user;
    socket.userId = user._id.toString();
    socket.collegeId = user.college?.toString() || null;
    next();
  } catch {
    next(new Error("Invalid or expired token"));
  }
};
