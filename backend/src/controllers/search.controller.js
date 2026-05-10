import * as postService from "../services/post.service.js";
import * as userService from "../services/user.service.js";
import * as collegeService from "../services/college.service.js";
import Announcement from "../models/announcement.model.js";
import Resource from "../models/resource.model.js";
import Event from "../models/event.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/apiResponse.js";

export const globalSearch = asyncHandler(async (req, res) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit || "5", 10), 1), 10);
  const query = { ...req.query, limit };
  const scoped = req.user?.college ? { college: req.user.college } : {};
  const text = req.query.q ? { $text: { $search: req.query.q } } : {};
  const [posts, users, colleges, announcements, resources, events] = await Promise.all([
    postService.searchPosts(query, req.user),
    userService.searchUsers(query, req.user),
    collegeService.listColleges(query),
    Announcement.find({ ...scoped, ...text }).limit(limit).sort({ createdAt: -1 }).lean(),
    Resource.find({ ...scoped, ...text }).limit(limit).sort({ createdAt: -1 }).lean(),
    Event.find({ ...scoped, ...text }).limit(limit).sort({ startsAt: 1 }).lean()
  ]);

  sendResponse(res, 200, "Search results loaded", {
    posts: posts.items,
    users: users.items,
    colleges: colleges.items,
    announcements,
    resources,
    events
  });
});
