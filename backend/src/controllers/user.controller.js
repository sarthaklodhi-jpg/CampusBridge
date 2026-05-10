import * as userService from "../services/user.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/apiResponse.js";

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user._id, req.body);
  sendResponse(res, 200, "Profile updated", { user });
});

export const uploadProfilePicture = asyncHandler(async (req, res) => {
  const result = await userService.uploadProfileImage(req.user._id, req.file, "profilePicture");
  sendResponse(res, 200, "Profile picture updated", result);
});

export const uploadCoverImage = asyncHandler(async (req, res) => {
  const result = await userService.uploadProfileImage(req.user._id, req.file, "coverImage");
  sendResponse(res, 200, "Cover image updated", result);
});

export const getProfile = asyncHandler(async (req, res) => {
  const user = await userService.getProfile(req.params.username);
  sendResponse(res, 200, "Profile loaded", { user });
});

export const searchUsers = asyncHandler(async (req, res) => {
  const result = await userService.searchUsers(req.query, req.user);
  sendResponse(res, 200, "Users loaded", { users: result.items }, result.meta);
});

export const suggestions = asyncHandler(async (req, res) => {
  const users = await userService.getSuggestions(req.user);
  sendResponse(res, 200, "Suggestions loaded", { users });
});
