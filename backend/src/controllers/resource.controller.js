import * as service from "../services/resource.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/apiResponse.js";

export const createResource = asyncHandler(async (req, res) => {
  const resource = await service.createResource(req.body, req.user);
  sendResponse(res, 201, "Resource shared", { resource });
});

export const listResources = asyncHandler(async (req, res) => {
  const result = await service.listResources(req.query, req.user);
  sendResponse(res, 200, "Resources loaded", { resources: result.items }, result.meta);
});

export const toggleSave = asyncHandler(async (req, res) => {
  const result = await service.toggleSave(req.params.id, req.user);
  sendResponse(res, 200, "Resource save updated", result);
});

export const deleteResource = asyncHandler(async (req, res) => {
  await service.deleteResource(req.params.id, req.user);
  sendResponse(res, 200, "Resource deleted");
});
