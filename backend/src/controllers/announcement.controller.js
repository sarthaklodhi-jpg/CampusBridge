import * as service from "../services/announcement.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/apiResponse.js";

export const createAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await service.createAnnouncement(req.body, req.user);
  sendResponse(res, 201, "Announcement created", { announcement });
});

export const listAnnouncements = asyncHandler(async (req, res) => {
  const result = await service.listAnnouncements(req.query, req.user);
  sendResponse(res, 200, "Announcements loaded", { announcements: result.items }, result.meta);
});

export const updateAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await service.updateAnnouncement(req.params.id, req.body, req.user);
  sendResponse(res, 200, "Announcement updated", { announcement });
});

export const deleteAnnouncement = asyncHandler(async (req, res) => {
  await service.deleteAnnouncement(req.params.id, req.user);
  sendResponse(res, 200, "Announcement deleted");
});

export const react = asyncHandler(async (req, res) => {
  const result = await service.toggleReaction(req.params.id, req.user);
  sendResponse(res, 200, "Announcement reaction updated", result);
});
