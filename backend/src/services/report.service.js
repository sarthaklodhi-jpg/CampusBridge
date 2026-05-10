import Report from "../models/report.model.js";
import Post from "../models/post.model.js";
import Comment from "../models/comment.model.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { buildPaginationMeta, getPagination } from "../utils/pagination.js";

const modelMap = { Post, Comment, User };

export const createReport = async (payload, user) => {
  if (!user.college) throw new ApiError(403, "Join a college before reporting content");
  const Model = modelMap[payload.targetType];
  const target = await Model.findById(payload.target);
  if (!target) throw new ApiError(404, "Reported item not found");

  if (payload.targetType === "Post" && !target.isPublic && String(target.college) !== String(user.college)) {
    throw new ApiError(403, "You cannot report content outside your college");
  }

  const report = await Report.create({ ...payload, college: user.college, reportedBy: user._id });
  return Report.findById(report._id).populate("reportedBy", "name username profilePicture");
};

export const listReports = async (query, user) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {
    college: user.college,
    ...(query.status ? { status: query.status } : {})
  };
  const [items, total] = await Promise.all([
    Report.find(filter).populate("reportedBy", "name username profilePicture").populate("reviewedBy", "name username").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Report.countDocuments(filter)
  ]);
  return { items, meta: buildPaginationMeta({ page, limit, total }) };
};

export const updateReport = async (id, payload, user) => {
  const report = await Report.findOneAndUpdate(
    { _id: id, college: user.college },
    { ...payload, reviewedBy: user._id, reviewedAt: new Date() },
    { new: true, runValidators: true }
  );
  if (!report) throw new ApiError(404, "Report not found");
  return report;
};
