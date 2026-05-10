import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import College from "../models/college.model.js";
import { ApiError } from "../utils/apiError.js";
import { createTokenId, hashToken, signAccessToken, signRefreshToken } from "../utils/tokens.js";
import { env } from "../config/env.js";

const refreshExpiry = () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

const buildAuthPayload = async (user) => {
  const tokenId = createTokenId();
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user, tokenId);

  user.refreshTokens.push({
    tokenId,
    tokenHash: hashToken(refreshToken),
    expiresAt: refreshExpiry()
  });

  await user.save();

  const safeUser = await User.findById(user._id)
    .select("-password -refreshTokens")
    .populate("college", "name slug logo joinCode");

  return { user: safeUser, accessToken, refreshToken };
};

export const register = async (payload) => {
  const exists = await User.exists({ $or: [{ email: payload.email }, { username: payload.username }] });
  if (exists) throw new ApiError(409, "Email or username already exists");

  let college = null;
  if (payload.joinCode) {
    college = await College.findOne({ joinCode: payload.joinCode });
    if (!college) throw new ApiError(404, "Invalid college join code");
  }

  const user = await User.create({
    name: payload.name,
    username: payload.username,
    email: payload.email,
    password: payload.password,
    branch: payload.branch,
    year: payload.year,
    college: college?._id
  });

  if (college) {
    college.studentsCount += 1;
    await college.save();
  }

  return buildAuthPayload(user);
};

export const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }
  if (!user.isActive) throw new ApiError(403, "This account is disabled");
  return buildAuthPayload(user);
};

export const refresh = async (refreshToken) => {
  if (!refreshToken) throw new ApiError(401, "Refresh token required");

  const payload = jwt.verify(refreshToken, env.jwtRefreshSecret);
  const user = await User.findById(payload.sub);
  if (!user || !user.isActive) throw new ApiError(401, "Invalid refresh session");

  const tokenHash = hashToken(refreshToken);
  const stored = user.refreshTokens.find(
    (item) => item.tokenId === payload.tokenId && item.tokenHash === tokenHash && item.expiresAt > new Date()
  );

  if (!stored) throw new ApiError(401, "Refresh session expired");

  user.refreshTokens = user.refreshTokens.filter((item) => item.tokenId !== payload.tokenId);
  return buildAuthPayload(user);
};

export const logout = async (userId, refreshToken) => {
  if (!refreshToken) return;
  const payload = jwt.decode(refreshToken);
  if (!payload?.tokenId) return;
  await User.findByIdAndUpdate(userId || payload.sub, {
    $pull: { refreshTokens: { tokenId: payload.tokenId } }
  });
};
