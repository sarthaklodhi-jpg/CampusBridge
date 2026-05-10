import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { buildPaginationMeta, getPagination } from "../utils/pagination.js";
import { ROLES, isCollegeAdminRole } from "../constants/roles.js";
import { createNotification } from "./notification.service.js";
import { REALTIME_EVENTS, publishRealtimeEvent } from "../realtime/events.js";

const populatePost = [
  { path: "author", select: "name username profilePicture role branch year college" },
  { path: "college", select: "name slug logo" }
];

export const createPost = async (payload, user) => {
  if (!user.college && !payload.isPublic) throw new ApiError(400, "Join a college before posting to a college feed");
  if (payload.type === "announcement" && !isCollegeAdminRole(user.role)) {
    throw new ApiError(403, "Only admins can create announcements");
  }

  const post = await Post.create({
    ...payload,
    author: user._id,
    college: user.college || null
  });

  const populated = await Post.findById(post._id).populate(populatePost).lean();
  publishRealtimeEvent(REALTIME_EVENTS.POST_CREATED, {
    collegeId: populated.college?._id?.toString() || populated.college?.toString(),
    post: populated
  });
  return populated;
};

export const listCollegeFeed = async (query, user) => {
  if (!user.college) throw new ApiError(400, "Join a college to view the college feed");
  const { page, limit, skip } = getPagination(query);
  const filter = { college: user.college };
  const [items, total] = await Promise.all([
    Post.find(filter).populate(populatePost).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Post.countDocuments(filter)
  ]);
  return { items, meta: buildPaginationMeta({ page, limit, total }) };
};

export const listPublicFeed = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = { isPublic: true };
  const [items, total] = await Promise.all([
    Post.find(filter).populate(populatePost).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Post.countDocuments(filter)
  ]);
  return { items, meta: buildPaginationMeta({ page, limit, total }) };
};

export const listTrendingPosts = async () =>
  Post.find({ isPublic: true })
    .populate(populatePost)
    .sort({ commentsCount: -1, likes: -1, createdAt: -1 })
    .limit(8)
    .lean();

export const updatePost = async (postId, payload, user) => {
  const post = await Post.findById(postId);
  if (!post) throw new ApiError(404, "Post not found");
  if (!post.author.equals(user._id) && ![ROLES.COLLEGE_ADMIN, ROLES.COLLEGE_OWNER, ROLES.SUPER_ADMIN].includes(user.role)) {
    throw new ApiError(403, "You cannot edit this post");
  }
  Object.assign(post, payload, { editedAt: new Date() });
  await post.save();
  return Post.findById(post._id).populate(populatePost);
};

export const deletePost = async (postId, user) => {
  const post = await Post.findById(postId);
  if (!post) throw new ApiError(404, "Post not found");
  if (!post.author.equals(user._id) && ![ROLES.COLLEGE_ADMIN, ROLES.COLLEGE_OWNER, ROLES.SUPER_ADMIN].includes(user.role)) {
    throw new ApiError(403, "You cannot delete this post");
  }
  await post.deleteOne();
};

export const toggleLike = async (postId, user) => {
  const post = await Post.findById(postId);
  if (!post) throw new ApiError(404, "Post not found");

  const liked = post.likes.some((id) => id.equals(user._id));
  post.likes = liked ? post.likes.filter((id) => !id.equals(user._id)) : [...post.likes, user._id];
  await post.save();

  if (!liked && !post.author.equals(user._id)) {
    await createNotification({
      recipient: post.author,
      actor: user._id,
      type: "like",
      entityType: "Post",
      entity: post._id,
      message: `${user.name} liked your post`
    });
  }

  const result = { liked: !liked, likesCount: post.likes.length };
  publishRealtimeEvent(REALTIME_EVENTS.POST_LIKED, {
    collegeId: post.college?.toString(),
    postId: post._id.toString(),
    userId: user._id.toString(),
    isPublic: post.isPublic,
    ...result
  });
  return result;
};

export const toggleSave = async (postId, user) => {
  const exists = user.savedPosts.some((id) => id.equals(postId));
  await User.findByIdAndUpdate(user._id, exists ? { $pull: { savedPosts: postId } } : { $addToSet: { savedPosts: postId } });
  return { saved: !exists };
};

export const getSavedPosts = async (user, query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = { _id: { $in: user.savedPosts } };
  const [items, total] = await Promise.all([
    Post.find(filter).populate(populatePost).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Post.countDocuments(filter)
  ]);
  return { items, meta: buildPaginationMeta({ page, limit, total }) };
};

export const searchPosts = async (query, user) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {
    ...(query.q ? { $text: { $search: query.q } } : {}),
    $or: [{ isPublic: true }, ...(user?.college ? [{ college: user.college }] : [])]
  };
  const [items, total] = await Promise.all([
    Post.find(filter).populate(populatePost).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Post.countDocuments(filter)
  ]);
  return { items, meta: buildPaginationMeta({ page, limit, total }) };
};
