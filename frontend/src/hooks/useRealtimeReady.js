import { useEffect } from "react";
import { useSocket } from "../context/SocketContext";

export function useRealtimeReady(channel, handler) {
  const { socket } = useSocket() || {};

  useEffect(() => {
    if (!socket || !channel || !handler) return undefined;
    socket.on(channel, handler);
    return () => {
      socket.off(channel, handler);
    };
  }, [socket, channel, handler]);
}
