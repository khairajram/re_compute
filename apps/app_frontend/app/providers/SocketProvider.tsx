"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { WEBSOCKET_URL } from "../config";

const SocketContext = createContext<WebSocket | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(WEBSOCKET_URL); // your backend

    ws.onopen = () => {
      console.log("Connected to the WebSocket server");
    };

    ws.onclose = () => {
      console.log("Disconnected from the WebSocket server");
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);