import Event from "../models/event.model.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { buildPaginationMeta, getPagination } from "../utils/pagination.js";
import { REALTIME_EVENTS, publishRealtimeEvent } from "../realtime/events.js";

const populate = [{ path: "createdBy", select: "name username profilePicture role" }];

export const createEvent = async (payload, user) => {
  const event = await Event.create({ ...payload, college: user.college, createdBy: user._id });
  const populated = await Event.findById(event._id).populate(populate).lean();
  publishRealtimeEvent(REALTIME_EVENTS.EVENT_CREATED, {
    collegeId: user.college?.toString(),
    event: populated
  });
  return populated;
};

export const listEvents = async (query, user) => {
  if (!user.college) throw new ApiError(403, "Join a college to view events");
  const { page, limit, skip } = getPagination(query);
  const filter = {
    college: user.college,
    ...(query.type ? { type: query.type } : {}),
    ...(query.q ? { $text: { $search: query.q } } : {}),
    ...(query.upcoming !== "false" ? { startsAt: { $gte: new Date() } } : {})
  };
  const [items, total] = await Promise.all([
    Event.find(filter).populate(populate).sort({ startsAt: 1 }).skip(skip).limit(limit).lean(),
    Event.countDocuments(filter)
  ]);
  return { items, meta: buildPaginationMeta({ page, limit, total }) };
};

export const toggleRsvp = async (id, user) => {
  const event = await Event.findOne({ _id: id, college: user.college });
  if (!event) throw new ApiError(404, "Event not found");
  const rsvped = event.rsvps.some((entry) => entry.equals(user._id));
  event.rsvps = rsvped ? event.rsvps.filter((entry) => !entry.equals(user._id)) : [...event.rsvps, user._id];
  await event.save();
  const result = { rsvped: !rsvped, rsvpCount: event.rsvps.length };
  publishRealtimeEvent(REALTIME_EVENTS.EVENT_RSVP_UPDATED, {
    collegeId: user.college?.toString(),
    eventId: event._id.toString(),
    userId: user._id.toString(),
    ...result
  });
  return result;
};

export const toggleBookmark = async (id, user) => {
  const event = await Event.findOne({ _id: id, college: user.college });
  if (!event) throw new ApiError(404, "Event not found");
  const bookmarked = event.bookmarks.some((entry) => entry.equals(user._id));
  event.bookmarks = bookmarked ? event.bookmarks.filter((entry) => !entry.equals(user._id)) : [...event.bookmarks, user._id];
  await Promise.all([
    event.save(),
    User.findByIdAndUpdate(user._id, bookmarked ? { $pull: { savedEvents: id } } : { $addToSet: { savedEvents: id } })
  ]);
  return { bookmarked: !bookmarked, bookmarksCount: event.bookmarks.length };
};
