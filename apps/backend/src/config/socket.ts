import { config } from "config";
import { Server } from "socket.io";
import type { Server as HTTPServer } from "http";

let io : Server;
export function initSocket(server:HTTPServer){
  io = new Server(server, {
  cors: {
    origin: config.clientOrigin,
    methods: ['GET', 'POST'],
  },
});

// Config sự kiện Socket.IO
io.on('connection', (socket) => {
  console.log('⚡ User connected:', socket.id);

  socket.on('testSocket', (msg) => {
    console.log('Receive from client:', msg);
    io.emit('testSocket', msg); // broadcast cho tất cả
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});
}
export function getIO():Server{
  if(!io) throw new Error("Socket.io not initialized");
  return io;
}