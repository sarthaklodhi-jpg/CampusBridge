import Comment from "../models/comment.model.js";
import Post from "../models/post.model.js";
import { ApiError } from "../utils/apiError.js";
import { buildPaginationMeta, getPagination } from "../utils/pagination.js";
import { createNotification } from "./notification.service.js";
import { REALTIME_EVENTS, publishRealtimeEvent } from "../realtime/events.js";

export const createComment = async (payload, user) => {
  const post = await Post.findById(payload.postId);
  if (!post) throw new ApiError(404, "Post not found");
  if (!post.isPublic && String(post.college) !== String(user.college)) {
    throw new ApiError(403, "You cannot comment outside your college ecosystem");
  }

  let parentComment = null;
  if (payload.parent) {
    parentComment = await Comment.findOne({ _id: payload.parent, post: post._id });
    const parent = parentComment;
    if (!parent) throw new ApiError(404, "Parent comment not found");
    if (parent.deletedAt) throw new ApiError(400, "Cannot reply to a deleted comment");
  }

  const comment = await Comment.create({
    post: post._id,
    author: user._id,
    parent: payload.parent || null,
    content: payload.content
  });

  post.commentsCount += 1;
  if (parentComment) parentComment.repliesCount += 1;
  await Promise.all([post.save(), parentComment ? parentComment.save() : Promise.resolve()]);

  const recipient = parentComment ? parentComment.author : post.author;

  if (!recipient.equals(user._id)) {
    await createNotification({
      recipient,
      actor: user._id,
      type: payload.parent ? "reply" : "comment",
      entityType: "Comment",
      entity: comment._id,
      message: payload.parent ? `${user.name} replied to your comment` : `${user.name} commented on your post`
    });
  }

  const populated = await Comment.findById(comment._id).populate("author", "name username profilePicture role").lean();
  publishRealtimeEvent(REALTIME_EVENTS.COMMENT_CREATED, {
    collegeId: post.college?.toString(),
    postId: post._id.toString(),
    comment: populated
  });
  return populated;
};

export const listComments = async (postId, query, user) => {
  const post = await Post.findById(postId).select("college isPublic");
  if (!post) throw new ApiError(404, "Post not found");
  if (!post.isPublic && String(post.college) !== String(user.college)) {
    throw new ApiError(403, "You cannot view comments outside your college ecosystem");
  }

  const { page, limit, skip } = getPagination(query);
  const parent = query.parent || null;
  const filter = { post: postId, parent };
  const [items, total] = await Promise.all([
    Comment.find(filter).populate("author", "name username profilePicture role").sort({ createdAt: 1 }).skip(skip).limit(limit).lean(),
    Comment.countDocuments(filter)
  ]);
  return { items, meta: buildPaginationMeta({ page, limit, total }) };
};

export const toggleCommentLike = async (commentId, user) => {
  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError(404, "Comment not found");
  if (comment.deletedAt) throw new ApiError(400, "Cannot like a deleted comment");
  const post = await Post.findById(comment.post).select("college isPublic");
  if (!post.isPublic && String(post.college) !== String(user.college)) {
    throw new ApiError(403, "You cannot like comments outside your college ecosystem");
  }
  const liked = comment.likes.some((id) => id.equals(user._id));
  comment.likes = liked ? comment.likes.filter((id) => !id.equals(user._id)) : [...comment.likes, user._id];
  await comment.save();
  const result = { liked: !liked, likesCount: comment.likes.length };
  publishRealtimeEvent(REALTIME_EVENTS.COMMENT_LIKED, {
    collegeId: post.college?.toString(),
    commentId: comment._id.toString(),
    userId: user._id.toString(),
    ...result
  });
  return result;
};

export const deleteComment = async (commentId, user) => {
  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError(404, "Comment not found");
  if (!comment.author.equals(user._id)) throw new ApiError(403, "You cannot delete this comment");
  comment.content = "This comment was deleted";
  comment.deletedAt = new Date();
  await comment.save();
  return comment;
};
