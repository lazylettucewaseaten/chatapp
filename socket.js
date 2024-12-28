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
  // const rooms = {};
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
    socket.on("join-room", ({roomname,userid}) => {
      socket.join(roomname);
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

    socket.on("userjoining", async ({ userid, roomname }) => {
      try {
        socket.to(roomname).emit("recieve-user-joining", {
          userid,roomname
        });
      } catch (error) {
        console.error("Error saving message:", error);
      }
    });

    socket.on("disconnect", () => {
    console.log("fuck off")
    });
  });
};

module.exports = socketHandler;
