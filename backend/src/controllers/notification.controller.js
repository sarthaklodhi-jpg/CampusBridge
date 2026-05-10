import * as notificationService from "../services/notification.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/apiResponse.js";

export const listNotifications = asyncHandler(async (req, res) => {
  const result = await notificationService.listNotifications(req.user._id, req.query);
  sendResponse(res, 200, "Notifications loaded", { notifications: result.items, unread: result.unread }, result.meta);
});

export const markRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markRead(req.user._id, req.params.id);
  sendResponse(res, 200, "Notification marked read", { notification });
});

export const markAllRead = asyncHandler(async (req, res) => {
  await notificationService.markAllRead(req.user._id);
  sendResponse(res, 200, "Notifications marked read");
});
