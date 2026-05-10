import * as commentService from "../services/comment.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/apiResponse.js";

export const createComment = asyncHandler(async (req, res) => {
  const comment = await commentService.createComment(req.body, req.user);
  sendResponse(res, 201, "Comment created", { comment });
});

export const listComments = asyncHandler(async (req, res) => {
  const result = await commentService.listComments(req.params.postId, req.query, req.user);
  sendResponse(res, 200, "Comments loaded", { comments: result.items }, result.meta);
});

export const toggleLike = asyncHandler(async (req, res) => {
  const result = await commentService.toggleCommentLike(req.params.id, req.user);
  sendResponse(res, 200, "Comment like updated", result);
});

export const deleteComment = asyncHandler(async (req, res) => {
  const comment = await commentService.deleteComment(req.params.id, req.user);
  sendResponse(res, 200, "Comment deleted", { comment });
});
