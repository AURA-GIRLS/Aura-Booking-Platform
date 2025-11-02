import { io, Socket } from "socket.io-client";
import { config } from ".";
export const initSocket = (): Socket => {
  const socket = io(config.originalAPI, {
      transports: ["websocket"], // ưu tiên websocket
      withCredentials: true,     // cho phép gửi cookie/session nếu cần
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    socket.on('connect', () => {
      console.log('Socket connected');
      const storedUser = localStorage.getItem('currentUser');
      const userJson =  JSON.parse(storedUser!!);
      const userId = userJson?._id;
      if (userId) {
        socket.emit('auth:user', userId);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // Reconnect after 1 second if server disconnects
        setTimeout(() => socket.connect(), 1000);
      }
    });
  return socket;
};
