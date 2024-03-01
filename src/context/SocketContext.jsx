import React, { createContext, useContext, useState } from "react";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  const addSocket = (_socket) => {
    setSocket(_socket);
  };

  const getSocket = () => {
    return socket;
  };

  return (
    <SocketContext.Provider value={{ addSocket, socket, getSocket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => {
  const context = useContext(SocketContext);

  if (context === null) {
    throw new Error("Socket connection error");
  }
  return context;
};
