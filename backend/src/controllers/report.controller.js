import * as service from "../services/report.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/apiResponse.js";

export const createReport = asyncHandler(async (req, res) => {
  const report = await service.createReport(req.body, req.user);
  sendResponse(res, 201, "Report submitted", { report });
});

export const listReports = asyncHandler(async (req, res) => {
  const result = await service.listReports(req.query, req.user);
  sendResponse(res, 200, "Reports loaded", { reports: result.items }, result.meta);
});

export const updateReport = asyncHandler(async (req, res) => {
  const report = await service.updateReport(req.params.id, req.body, req.user);
  sendResponse(res, 200, "Report updated", { report });
});
