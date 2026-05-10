import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Resource from "../models/resource.model.js";
import Event from "../models/event.model.js";
import Report from "../models/report.model.js";

export const getCollegeAnalytics = async (user) => {
  const college = user.college;
  const [members, admins, posts, resources, events, openReports, trendingTags] = await Promise.all([
    User.countDocuments({ college }),
    User.countDocuments({ college, role: { $in: ["college_admin", "college_owner"] } }),
    Post.countDocuments({ college }),
    Resource.countDocuments({ college }),
    Event.countDocuments({ college }),
    Report.countDocuments({ college, status: { $in: ["open", "reviewing"] } }),
    Post.aggregate([
      { $match: { college } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 }
    ])
  ]);

  return {
    members,
    admins,
    posts,
    resources,
    events,
    openReports,
    trendingTags: trendingTags.map((tag) => ({ tag: tag._id, count: tag.count }))
  };
};
