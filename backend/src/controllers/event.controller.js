import * as service from "../services/event.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/apiResponse.js";

export const createEvent = asyncHandler(async (req, res) => {
  const event = await service.createEvent(req.body, req.user);
  sendResponse(res, 201, "Event created", { event });
});

export const listEvents = asyncHandler(async (req, res) => {
  const result = await service.listEvents(req.query, req.user);
  sendResponse(res, 200, "Events loaded", { events: result.items }, result.meta);
});

export const rsvp = asyncHandler(async (req, res) => {
  const result = await service.toggleRsvp(req.params.id, req.user);
  sendResponse(res, 200, "RSVP updated", result);
});

export const bookmark = asyncHandler(async (req, res) => {
  const result = await service.toggleBookmark(req.params.id, req.user);
  sendResponse(res, 200, "Event bookmark updated", result);
});
