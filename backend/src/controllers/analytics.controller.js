import * as service from "../services/analytics.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/apiResponse.js";

export const collegeAnalytics = asyncHandler(async (req, res) => {
  const analytics = await service.getCollegeAnalytics(req.user);
  sendResponse(res, 200, "Analytics loaded", { analytics });
});
