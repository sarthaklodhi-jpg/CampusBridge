import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { connectSocket, disconnectSocket } from "../services/socket";
import { useAuthState } from "./AuthContext";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { token, isAuthenticated } = useAuthState();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token || !isAuthenticated) {
      disconnectSocket();
      setSocket(null);
      setConnected(false);
      return undefined;
    }

    const nextSocket = connectSocket(token);
    setSocket(nextSocket);

    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);

    nextSocket.on("connect", handleConnect);
    nextSocket.on("disconnect", handleDisconnect);
    setConnected(nextSocket.connected);

    return () => {
      nextSocket.off("connect", handleConnect);
      nextSocket.off("disconnect", handleDisconnect);
    };
  }, [token, isAuthenticated]);

  const value = useMemo(() => ({ socket, connected }), [socket, connected]);

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export const useSocket = () => useContext(SocketContext);
