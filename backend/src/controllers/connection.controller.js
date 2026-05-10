import * as connectionService from "../services/connection.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/apiResponse.js";

export const sendRequest = asyncHandler(async (req, res) => {
  const request = await connectionService.sendConnectionRequest(req.params.userId, req.user);
  sendResponse(res, 201, "Connection request sent", { request });
});

export const acceptRequest = asyncHandler(async (req, res) => {
  const request = await connectionService.respondToConnectionRequest(req.params.id, "accepted", req.user);
  sendResponse(res, 200, "Connection request accepted", { request });
});

export const rejectRequest = asyncHandler(async (req, res) => {
  const request = await connectionService.respondToConnectionRequest(req.params.id, "rejected", req.user);
  sendResponse(res, 200, "Connection request rejected", { request });
});

export const removeConnection = asyncHandler(async (req, res) => {
  await connectionService.removeConnection(req.params.userId, req.user);
  sendResponse(res, 200, "Connection removed");
});

export const listRequests = asyncHandler(async (req, res) => {
  const requests = await connectionService.listRequests(req.user);
  sendResponse(res, 200, "Connection requests loaded", { requests });
});
