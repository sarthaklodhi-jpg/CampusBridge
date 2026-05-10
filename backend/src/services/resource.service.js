import Resource from "../models/resource.model.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { buildPaginationMeta, getPagination } from "../utils/pagination.js";

const populate = [{ path: "uploadedBy", select: "name username profilePicture role" }];

export const createResource = async (payload, user) => {
  if (!user.college) throw new ApiError(403, "Join a college before sharing resources");
  const resource = await Resource.create({ ...payload, college: user.college, uploadedBy: user._id });
  return Resource.findById(resource._id).populate(populate);
};

export const listResources = async (query, user) => {
  if (!user.college) throw new ApiError(403, "Join a college to view resources");
  const { page, limit, skip } = getPagination(query);
  const filter = {
    college: user.college,
    ...(query.category ? { category: query.category } : {}),
    ...(query.q ? { $text: { $search: query.q } } : {})
  };
  const [items, total] = await Promise.all([
    Resource.find(filter).populate(populate).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Resource.countDocuments(filter)
  ]);
  return { items, meta: buildPaginationMeta({ page, limit, total }) };
};

export const toggleSave = async (id, user) => {
  const resource = await Resource.findOne({ _id: id, college: user.college });
  if (!resource) throw new ApiError(404, "Resource not found");
  const saved = resource.savedBy.some((entry) => entry.equals(user._id));
  resource.savedBy = saved ? resource.savedBy.filter((entry) => !entry.equals(user._id)) : [...resource.savedBy, user._id];
  await Promise.all([
    resource.save(),
    User.findByIdAndUpdate(user._id, saved ? { $pull: { savedResources: id } } : { $addToSet: { savedResources: id } })
  ]);
  return { saved: !saved, savesCount: resource.savedBy.length };
};

export const deleteResource = async (id, user) => {
  const resource = await Resource.findOne({ _id: id, college: user.college });
  if (!resource) throw new ApiError(404, "Resource not found");
  if (!resource.uploadedBy.equals(user._id) && !["college_admin", "college_owner", "super_admin"].includes(user.role)) {
    throw new ApiError(403, "You cannot delete this resource");
  }
  await resource.deleteOne();
};
