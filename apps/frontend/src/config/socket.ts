import { io, Socket } from "socket.io-client";
import { config } from ".";

let socket: Socket | null = null;

export const initSocket = (): Socket => {
  if (!socket) {
    socket = io(config.originalAPI, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket?.id);
      const storedUser = localStorage.getItem("currentUser");
      if (storedUser) {
        const userJson = JSON.parse(storedUser);
        if (userJson?._id) {
          socket!.emit("auth:user", userJson._id);
          console.log("👤 Authenticated as user:", userJson._id);
        }
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
      if (reason === "io server disconnect") {
        setTimeout(() => socket?.connect(), 1000);
      }
    });
  }

  return socket;
};
export const getSocket = (): Socket => {
  if (!socket) {
    socket = initSocket();
    return socket;
  }
  return socket;
};


