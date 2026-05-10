import { isProduction } from "../config/env.js";

export const refreshCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/api/v1/auth/refresh",
  maxAge: 7 * 24 * 60 * 60 * 1000
};
