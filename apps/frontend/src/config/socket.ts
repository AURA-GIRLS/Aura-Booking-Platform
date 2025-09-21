import { io, Socket } from "socket.io-client";
import { config } from ".";
export const socket: Socket = io(config.publicClient, {
  transports: ["websocket"], // ưu tiên websocket
  withCredentials: true,     // cho phép gửi cookie/session nếu cần
});