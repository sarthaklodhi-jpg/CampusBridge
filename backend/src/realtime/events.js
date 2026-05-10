import { EventEmitter } from "events";

export const realtimeBus = new EventEmitter();

export const REALTIME_EVENTS = {
  COMMENT_CREATED: "comment:created",
  COMMENT_LIKED: "comment:liked",
  COMMENT_DELETED: "comment:deleted",
  POST_CREATED: "post:created",
  POST_LIKED: "post:liked",
  POST_UPDATED: "post:updated",
  POST_DELETED: "post:deleted",
  NOTIFICATION_CREATED: "notification:created",
  NOTIFICATION_READ: "notification:read",
  ANNOUNCEMENT_CREATED: "announcement:created",
  ANNOUNCEMENT_UPDATED: "announcement:updated",
  ANNOUNCEMENT_DELETED: "announcement:deleted",
  ANNOUNCEMENT_REACTED: "announcement:reacted",
  EVENT_CREATED: "event:created",
  EVENT_RSVP_UPDATED: "event:rsvp_updated",
  MODERATION_ACTION: "moderation:action",
  USER_ONLINE: "user:online",
  USER_OFFLINE: "user:offline",
  USER_TYPING: "user:typing",
  USER_STOPPED_TYPING: "user:stopped_typing"
};

export const publishRealtimeEvent = (event, payload) => {
  realtimeBus.emit(event, payload);
};

export const bindRealtimeBus = ({ emitToCollege, emitToUser, emitPublic }) => {
  realtimeBus.on(REALTIME_EVENTS.NOTIFICATION_CREATED, (notification) => {
    emitToUser(notification.recipient?.toString(), REALTIME_EVENTS.NOTIFICATION_CREATED, notification);
  });

  realtimeBus.on(REALTIME_EVENTS.COMMENT_CREATED, ({ collegeId, postId, comment }) => {
    emitToCollege(collegeId, REALTIME_EVENTS.COMMENT_CREATED, { postId, comment });
  });

  realtimeBus.on(REALTIME_EVENTS.COMMENT_LIKED, ({ collegeId, ...payload }) => {
    emitToCollege(collegeId, REALTIME_EVENTS.COMMENT_LIKED, payload);
  });

  realtimeBus.on(REALTIME_EVENTS.POST_CREATED, ({ collegeId, post }) => {
    if (post?.isPublic) emitPublic(REALTIME_EVENTS.POST_CREATED, { post });
    emitToCollege(collegeId, REALTIME_EVENTS.POST_CREATED, { post });
  });

  realtimeBus.on(REALTIME_EVENTS.POST_LIKED, ({ collegeId, ...payload }) => {
    if (payload.isPublic) emitPublic(REALTIME_EVENTS.POST_LIKED, payload);
    emitToCollege(collegeId, REALTIME_EVENTS.POST_LIKED, payload);
  });

  realtimeBus.on(REALTIME_EVENTS.ANNOUNCEMENT_CREATED, ({ collegeId, announcement }) => {
    emitToCollege(collegeId, REALTIME_EVENTS.ANNOUNCEMENT_CREATED, { announcement });
  });

  realtimeBus.on(REALTIME_EVENTS.ANNOUNCEMENT_UPDATED, ({ collegeId, announcement }) => {
    emitToCollege(collegeId, REALTIME_EVENTS.ANNOUNCEMENT_UPDATED, { announcement });
  });

  realtimeBus.on(REALTIME_EVENTS.ANNOUNCEMENT_DELETED, ({ collegeId, announcementId }) => {
    emitToCollege(collegeId, REALTIME_EVENTS.ANNOUNCEMENT_DELETED, { announcementId });
  });

  realtimeBus.on(REALTIME_EVENTS.EVENT_CREATED, ({ collegeId, event }) => {
    emitToCollege(collegeId, REALTIME_EVENTS.EVENT_CREATED, { event });
  });

  realtimeBus.on(REALTIME_EVENTS.EVENT_RSVP_UPDATED, ({ collegeId, ...payload }) => {
    emitToCollege(collegeId, REALTIME_EVENTS.EVENT_RSVP_UPDATED, payload);
  });
};
