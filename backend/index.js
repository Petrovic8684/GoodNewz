const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const socketIO = require("socket.io");

const { connectDB } = require("./config/db");
const { initCloudinary } = require("./config/cloudinary");

const userRoutes = require("./routes/userRoutes.js");
const requestRoutes = require("./routes/requestRoutes.js");
const friendRoutes = require("./routes/friendRoutes.js");
const chatRoutes = require("./routes/chatRoutes.js");
const messageRoutes = require("./routes/messageRoutes.js");

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json({ limit: "10mb" }));

const io = socketIO(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinChat", (chatId) => {
    socket.join(chatId);
  });

  socket.on("typing", (chatId) => {
    socket.to(chatId).emit("typing", chatId);
  });

  socket.on("stopTyping", (chatId) => {
    socket.to(chatId).emit("stopTyping", chatId);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

connectDB();
initCloudinary();

app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to GoodNewz!" });
});

app.use("/users", userRoutes);
app.use("/requests", requestRoutes);
app.use("/friends", friendRoutes);
app.use("/chats", chatRoutes);
app.use("/messages", messageRoutes);

module.exports = server;
