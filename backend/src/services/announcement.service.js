import Announcement from "../models/announcement.model.js";
import { ApiError } from "../utils/apiError.js";
import { buildPaginationMeta, getPagination } from "../utils/pagination.js";
import { createNotification } from "./notification.service.js";
import { REALTIME_EVENTS, publishRealtimeEvent } from "../realtime/events.js";

const populate = [{ path: "createdBy", select: "name username profilePicture role" }];

export const createAnnouncement = async (payload, user) => {
  const announcement = await Announcement.create({
    ...payload,
    college: user.college,
    createdBy: user._id
  });

  await createNotification({
    recipient: user._id,
    actor: user._id,
    type: "announcement",
    entityType: "College",
    entity: user.college,
    message: `Announcement published: ${payload.title}`
  });

  const populated = await Announcement.findById(announcement._id).populate(populate).lean();
  publishRealtimeEvent(REALTIME_EVENTS.ANNOUNCEMENT_CREATED, {
    collegeId: user.college?.toString(),
    announcement: populated
  });
  return populated;
};

export const listAnnouncements = async (query, user) => {
  if (!user.college) throw new ApiError(403, "Join a college to view announcements");
  const { page, limit, skip } = getPagination(query);
  const filter = {
    college: user.college,
    ...(query.priority ? { priority: query.priority } : {}),
    ...(query.q ? { $text: { $search: query.q } } : {})
  };
  const [items, total] = await Promise.all([
    Announcement.find(filter).populate(populate).sort({ pinned: -1, priority: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
    Announcement.countDocuments(filter)
  ]);
  return { items, meta: buildPaginationMeta({ page, limit, total }) };
};

export const updateAnnouncement = async (id, payload, user) => {
  const announcement = await Announcement.findOneAndUpdate(
    { _id: id, college: user.college },
    { ...payload },
    { new: true, runValidators: true }
  ).populate(populate);
  if (!announcement) throw new ApiError(404, "Announcement not found");
  publishRealtimeEvent(REALTIME_EVENTS.ANNOUNCEMENT_UPDATED, {
    collegeId: user.college?.toString(),
    announcement
  });
  return announcement;
};

export const deleteAnnouncement = async (id, user) => {
  const announcement = await Announcement.findOneAndDelete({ _id: id, college: user.college });
  if (!announcement) throw new ApiError(404, "Announcement not found");
  publishRealtimeEvent(REALTIME_EVENTS.ANNOUNCEMENT_DELETED, {
    collegeId: user.college?.toString(),
    announcementId: id
  });
};

export const toggleReaction = async (id, user) => {
  const announcement = await Announcement.findOne({ _id: id, college: user.college });
  if (!announcement) throw new ApiError(404, "Announcement not found");
  const reacted = announcement.reactions.some((item) => item.equals(user._id));
  announcement.reactions = reacted
    ? announcement.reactions.filter((item) => !item.equals(user._id))
    : [...announcement.reactions, user._id];
  await announcement.save();
  return { reacted: !reacted, reactionsCount: announcement.reactions.length };
};
