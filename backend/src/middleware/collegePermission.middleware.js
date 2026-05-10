import College from "../models/college.model.js";
import { ROLES, isCollegeAdminRole } from "../constants/roles.js";
import { ApiError } from "../utils/apiError.js";

export const requireCollege = (req, _res, next) => {
  if (!req.user.college) return next(new ApiError(403, "Join a college before using this feature"));
  next();
};

export const requireCollegeAdmin = async (req, _res, next) => {
  try {
    if (!req.user.college || !isCollegeAdminRole(req.user.role)) {
      throw new ApiError(403, "College admin permissions required");
    }

    const college = await College.findById(req.user.college);
    if (!college) throw new ApiError(404, "College not found");

    const isAdmin = college.admins.some((id) => id.equals(req.user._id));
    const isOwner = (college.owner || college.createdBy)?.equals(req.user._id);
    if (!isAdmin && !isOwner && req.user.role !== ROLES.SUPER_ADMIN) {
      throw new ApiError(403, "College admin permissions required");
    }

    req.college = college;
    next();
  } catch (error) {
    next(error);
  }
};

export const requireCollegeOwner = async (req, _res, next) => {
  try {
    if (!req.user.college) throw new ApiError(403, "College ownership required");

    const college = await College.findById(req.user.college);
    if (!college) throw new ApiError(404, "College not found");

    if (!(college.owner || college.createdBy)?.equals(req.user._id) && req.user.role !== ROLES.SUPER_ADMIN) {
      throw new ApiError(403, "Only the college owner can perform this action");
    }

    req.college = college;
    next();
  } catch (error) {
    next(error);
  }
};
