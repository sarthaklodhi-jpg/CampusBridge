import * as authService from "../services/auth.service.js";
import * as userService from "../services/user.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { refreshCookieOptions } from "../utils/cookies.js";
import { sendResponse } from "../utils/apiResponse.js";

const setRefreshCookie = (res, token) => res.cookie("refreshToken", token, refreshCookieOptions);

export const register = asyncHandler(async (req, res) => {
  const payload = await authService.register(req.body);
  setRefreshCookie(res, payload.refreshToken);
  sendResponse(res, 201, "Account created", { user: payload.user, accessToken: payload.accessToken });
});

export const login = asyncHandler(async (req, res) => {
  const payload = await authService.login(req.body);
  setRefreshCookie(res, payload.refreshToken);
  sendResponse(res, 200, "Logged in", { user: payload.user, accessToken: payload.accessToken });
});

export const refresh = asyncHandler(async (req, res) => {
  const payload = await authService.refresh(req.cookies.refreshToken);
  setRefreshCookie(res, payload.refreshToken);
  sendResponse(res, 200, "Token refreshed", { user: payload.user, accessToken: payload.accessToken });
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user?._id, req.cookies.refreshToken);
  res.clearCookie("refreshToken", refreshCookieOptions);
  sendResponse(res, 200, "Logged out");
});

export const me = asyncHandler(async (req, res) => {
  const user = await userService.getMe(req.user._id);
  sendResponse(res, 200, "Current user loaded", { user });
});
