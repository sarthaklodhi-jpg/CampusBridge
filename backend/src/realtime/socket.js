import { Server } from "socket.io";
import { env } from "../config/env.js";
import { authenticateSocket } from "../middleware/socket.auth.js";
import { bindRealtimeBus, REALTIME_EVENTS } from "./events.js";

let io = null;
const onlineUsers = new Map();

const collegeRoom = (collegeId) => `college:${collegeId}`;
const userRoom = (userId) => `user:${userId}`;

export const getSocketServer = () => io;
export const getOnlineUserIds = () => [...onlineUsers.keys()];

export const configureSocketServer = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: env.clientUrl,
      credentials: true
    },
    transports: ["websocket", "polling"],
    pingInterval: 25000,
    pingTimeout: 60000
  });

  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    onlineUsers.set(socket.userId, {
      userId: socket.userId,
      collegeId: socket.collegeId,
      connectedAt: new Date().toISOString()
    });

    socket.join(userRoom(socket.userId));
    if (socket.collegeId) {
      socket.join(collegeRoom(socket.collegeId));
      socket.to(collegeRoom(socket.collegeId)).emit(REALTIME_EVENTS.USER_ONLINE, {
        userId: socket.userId,
        collegeId: socket.collegeId
      });
    }

    socket.on(REALTIME_EVENTS.USER_TYPING, ({ postId }) => {
      if (!socket.collegeId || !postId) return;
      socket.to(collegeRoom(socket.collegeId)).emit(REALTIME_EVENTS.USER_TYPING, {
        postId,
        userId: socket.userId,
        name: socket.user.name
      });
    });

    socket.on(REALTIME_EVENTS.USER_STOPPED_TYPING, ({ postId }) => {
      if (!socket.collegeId || !postId) return;
      socket.to(collegeRoom(socket.collegeId)).emit(REALTIME_EVENTS.USER_STOPPED_TYPING, {
        postId,
        userId: socket.userId
      });
    });

    socket.on("disconnect", () => {
      onlineUsers.delete(socket.userId);
      if (socket.collegeId) {
        socket.to(collegeRoom(socket.collegeId)).emit(REALTIME_EVENTS.USER_OFFLINE, {
          userId: socket.userId,
          collegeId: socket.collegeId
        });
      }
    });
  });

  bindRealtimeBus({
    emitToCollege: (collegeId, event, payload) => {
      if (collegeId) io.to(collegeRoom(collegeId)).emit(event, payload);
    },
    emitToUser: (userId, event, payload) => {
      if (userId) io.to(userRoom(userId)).emit(event, payload);
    },
    emitPublic: (event, payload) => io.emit(event, payload)
  });

  return io;
};
