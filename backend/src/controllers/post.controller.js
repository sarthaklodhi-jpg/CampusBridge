import * as postService from "../services/post.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/apiResponse.js";

export const createPost = asyncHandler(async (req, res) => {
  const post = await postService.createPost(req.body, req.user);
  sendResponse(res, 201, "Post created", { post });
});

export const collegeFeed = asyncHandler(async (req, res) => {
  const result = await postService.listCollegeFeed(req.query, req.user);
  sendResponse(res, 200, "College feed loaded", { posts: result.items }, result.meta);
});

export const publicFeed = asyncHandler(async (req, res) => {
  const result = await postService.listPublicFeed(req.query);
  sendResponse(res, 200, "Public feed loaded", { posts: result.items }, result.meta);
});

export const trending = asyncHandler(async (_req, res) => {
  const posts = await postService.listTrendingPosts();
  sendResponse(res, 200, "Trending posts loaded", { posts });
});

export const updatePost = asyncHandler(async (req, res) => {
  const post = await postService.updatePost(req.params.id, req.body, req.user);
  sendResponse(res, 200, "Post updated", { post });
});

export const deletePost = asyncHandler(async (req, res) => {
  await postService.deletePost(req.params.id, req.user);
  sendResponse(res, 200, "Post deleted");
});

export const toggleLike = asyncHandler(async (req, res) => {
  const result = await postService.toggleLike(req.params.id, req.user);
  sendResponse(res, 200, "Post like updated", result);
});

export const toggleSave = asyncHandler(async (req, res) => {
  const result = await postService.toggleSave(req.params.id, req.user);
  sendResponse(res, 200, "Post save updated", result);
});

export const savedPosts = asyncHandler(async (req, res) => {
  const result = await postService.getSavedPosts(req.user, req.query);
  sendResponse(res, 200, "Saved posts loaded", { posts: result.items }, result.meta);
});
