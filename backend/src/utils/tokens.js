import jwt from "jsonwebtoken";
import crypto from "crypto";
import { env } from "../config/env.js";

export const signAccessToken = (user) =>
  jwt.sign(
    { sub: user._id.toString(), role: user.role, college: user.college?.toString() || null },
    env.jwtAccessSecret,
    { expiresIn: env.jwtAccessExpiresIn }
  );

export const signRefreshToken = (user, tokenId) =>
  jwt.sign({ sub: user._id.toString(), tokenId }, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn
  });

export const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

export const createTokenId = () => crypto.randomBytes(32).toString("hex");
