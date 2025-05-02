import { Server } from "socket.io";

let io;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on("connection", (socket) => {
    // El usuario se une a una sala con su qrCode
    socket.on("join", (qrCode) => {
      socket.join(qrCode);
    });
  });
}

function notifyPuntoSumado(qrCode) {
  if (io) {
    io.to(qrCode).emit("punto-sumado");
  }
}

export { initSocket, notifyPuntoSumado };
