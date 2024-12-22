const { Server } = require("socket.io");
const jwt = require('jsonwebtoken');
const { messageschema } = require('./models/schema');

const socketHandler = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PATCH"],
      credentials: true,
    },
  });

  const authenticateSocket = (socket, next) => {
    const token = socket.handshake.auth.token;
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = payload.userId;
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  };

  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    // console.log(`User connected: ${socket.id}`);

    socket.on("join-room", (roomname) => {
      socket.join(roomname);
    //   console.log(`User ${socket.id} joined room ${roomname}`);
    });

    socket.on("message", async ({ message, room }) => {
      try {
        const newMessage = new messageschema({ room, userId: socket.userId, message });
        await newMessage.save();

        socket.to(room).emit("recieve-message", {
          userId: socket.id,
          message: message,
        });
      } catch (error) {
        console.error("Error saving message:", error);
      }
    });

    socket.on("disconnect", () => {
    //   console.log(`User ${socket.id} disconnected`);
    });
  });
};

module.exports = socketHandler;
