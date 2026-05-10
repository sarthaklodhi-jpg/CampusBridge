import Notification from "../models/notification.model.js";
import { buildPaginationMeta, getPagination } from "../utils/pagination.js";
import { REALTIME_EVENTS, publishRealtimeEvent } from "../realtime/events.js";

export const createNotification = async (payload) => {
  const notification = await (await Notification.create(payload)).populate("actor", "name username profilePicture");
  publishRealtimeEvent(REALTIME_EVENTS.NOTIFICATION_CREATED, notification);
  return notification;
};

export const listNotifications = async (userId, query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = { recipient: userId };
  const [items, total, unread] = await Promise.all([
    Notification.find(filter).populate("actor", "name username profilePicture").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ recipient: userId, readAt: null })
  ]);
  return { items, unread, meta: buildPaginationMeta({ page, limit, total }) };
};

export const markRead = (userId, id) =>
  Notification.findOneAndUpdate({ _id: id, recipient: userId }, { readAt: new Date() }, { new: true });

export const markAllRead = (userId) =>
  Notification.updateMany({ recipient: userId, readAt: null }, { readAt: new Date() });
