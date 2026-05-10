import { io } from "socket.io-client";

const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";
const socketUrl = import.meta.env.VITE_SOCKET_URL || apiBase.replace(/\/api\/v1\/?$/, "");

let socket = null;

export const connectSocket = (token) => {
  if (!token) return null;

  if (socket?.connected) return socket;
  if (socket) socket.disconnect();

  socket = io(socketUrl, {
    auth: { token },
    withCredentials: true,
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 500,
    reconnectionDelayMax: 5000
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
