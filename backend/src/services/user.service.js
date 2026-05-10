import User from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { buildPaginationMeta, getPagination } from "../utils/pagination.js";
import { uploadBufferToCloudinary } from "../utils/cloudinaryUpload.js";

const publicPopulate = "name slug logo";

export const getMe = (userId) =>
  User.findById(userId).select("-password -refreshTokens").populate("college", publicPopulate);

export const updateProfile = (userId, payload) =>
  User.findByIdAndUpdate(userId, payload, { new: true, runValidators: true })
    .select("-password -refreshTokens")
    .populate("college", publicPopulate);

export const uploadProfileImage = async (userId, file, field) => {
  const uploaded = await uploadBufferToCloudinary(file, `campusbridge/users/${userId}`);
  const user = await User.findByIdAndUpdate(
    userId,
    { [field]: uploaded.url },
    { new: true, runValidators: true }
  )
    .select("-password -refreshTokens")
    .populate("college", publicPopulate);
  return { user, upload: uploaded };
};

export const getProfile = async (username) => {
  const user = await User.findOne({ username })
    .select("-password -refreshTokens")
    .populate("college", publicPopulate)
    .populate("connections", "name username profilePicture college");
  if (!user) throw new ApiError(404, "User not found");
  return user;
};

export const searchUsers = async (query, currentUser) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {
    _id: { $ne: currentUser._id },
    ...(query.q ? { $text: { $search: query.q } } : {}),
    ...(query.collegeOnly === "true" && currentUser.college ? { college: currentUser.college } : {})
  };

  const [items, total] = await Promise.all([
    User.find(filter).select("name username profilePicture bio skills branch year college").populate("college", publicPopulate).skip(skip).limit(limit).lean(),
    User.countDocuments(filter)
  ]);

  return { items, meta: buildPaginationMeta({ page, limit, total }) };
};

export const getSuggestions = async (currentUser) => {
  // More efficient: use aggregation pipeline instead of $nin on large array
  return User.aggregate([
    {
      $match: {
        _id: { $ne: currentUser._id },
        ...(currentUser.college ? { college: currentUser.college } : { college: { $exists: false } })
      }
    },
    {
      $addFields: {
        isConnected: { $in: ["$_id", currentUser.connections] }
      }
    },
    {
      $match: { isConnected: false }
    },
    {
      $project: {
        name: 1,
        username: 1,
        profilePicture: 1,
        bio: 1,
        skills: 1,
        branch: 1,
        year: 1
      }
    },
    { $limit: 8 }
  ]);
};
