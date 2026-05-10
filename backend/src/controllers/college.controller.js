import * as collegeService from "../services/college.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/apiResponse.js";

export const createCollege = asyncHandler(async (req, res) => {
  const college = await collegeService.createCollege(req.body, req.user);
  sendResponse(res, 201, "College created", { college });
});

export const joinCollege = asyncHandler(async (req, res) => {
  const college = await collegeService.joinCollege(req.body, req.user);
  sendResponse(res, 200, "Joined college", { college });
});

export const myCollege = asyncHandler(async (req, res) => {
  const college = await collegeService.getMyCollege(req.user);
  sendResponse(res, 200, "Current college loaded", { college });
});

export const getCollege = asyncHandler(async (req, res) => {
  const college = await collegeService.getCollege(req.params.slug);
  sendResponse(res, 200, "College loaded", { college });
});

export const listColleges = asyncHandler(async (req, res) => {
  const result = await collegeService.listColleges(req.query);
  sendResponse(res, 200, "Colleges loaded", { colleges: result.items }, result.meta);
});

export const updateMemberRole = asyncHandler(async (req, res) => {
  const member = await collegeService.updateMemberRole(req.params.collegeId, req.user, req.params.memberId, req.body.role);
  sendResponse(res, 200, "Role updated", { member });
});

export const listMembers = asyncHandler(async (req, res) => {
  const result = await collegeService.listMembers(req.user.college, req.query);
  sendResponse(res, 200, "College members loaded", { members: result.items }, result.meta);
});

export const leaveCollege = asyncHandler(async (req, res) => {
  await collegeService.leaveCollege(req.user);
  sendResponse(res, 200, "You left the college");
});

export const removeMember = asyncHandler(async (req, res) => {
  await collegeService.removeMember(req.college, req.user, req.params.memberId);
  sendResponse(res, 200, "Member removed");
});

export const transferOwnership = asyncHandler(async (req, res) => {
  const owner = await collegeService.transferOwnership(req.college, req.params.memberId);
  sendResponse(res, 200, "Ownership transferred", { owner });
});

export const createInvite = asyncHandler(async (req, res) => {
  const invite = await collegeService.createInvite(req.college, req.user, req.body);
  sendResponse(res, 201, "Invite created", { invite });
});

export const listInvites = asyncHandler(async (req, res) => {
  const invites = await collegeService.listInvites(req.user.college);
  sendResponse(res, 200, "Invites loaded", { invites });
});

export const revokeInvite = asyncHandler(async (req, res) => {
  const invite = await collegeService.revokeInvite(req.user.college, req.params.inviteId);
  sendResponse(res, 200, "Invite revoked", { invite });
});

export const updateCollege = asyncHandler(async (req, res) => {
  const college = await collegeService.updateCollegeProfile(req.college, req.body);
  sendResponse(res, 200, "College profile updated", { college });
});

export const uploadLogo = asyncHandler(async (req, res) => {
  const result = await collegeService.uploadCollegeImage(req.college, req.file, "logo");
  sendResponse(res, 200, "College logo updated", result);
});

export const uploadBanner = asyncHandler(async (req, res) => {
  const result = await collegeService.uploadCollegeImage(req.college, req.file, "bannerImage");
  sendResponse(res, 200, "College banner updated", result);
});
