import { io, Socket } from "socket.io-client";
import { config } from ".";
export const socket: Socket = io(config.originalAPI, {
  transports: ["websocket"], // ưu tiên websocket
  withCredentials: true,     // cho phép gửi cookie/session nếu cần
});
socket.on("connect", () => {
  console.log("✅ Socket connected:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.log("❌ Socket disconnected:", reason);
});

socket.on("connect_error", (err) => {
  console.error("⚠️ Socket connect error:", err.message);
});
