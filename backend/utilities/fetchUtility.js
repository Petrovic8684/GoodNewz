const UserModel = require("../models/userModel");
const ChatModel = require("../models/chatModel");
const MessageModel = require("../models/messageModel");

const fetchUserById = async (userId) => {
  try {
    const user = await UserModel.findById(userId)
      .populate("friends", "username image")
      .populate("sentRequests", "username image")
      .populate("pendingRequests", "username image");
    if (!user) return null;

    return user;
  } catch (error) {
    console.error("Error fetching user by id!", error.message);
    return null;
  }
};

const fetchChatById = async (chatId) => {
  try {
    const chat = await ChatModel.findById(chatId)
      .populate("userMe", "username image lastSeen")
      .populate("userThem", "username image lastSeen")
      .populate({
        path: "messages",
        select: "text author createdAt replyTo",
        populate: {
          path: "replyTo",
          select: "text",
        },
      });
    if (!chat) return null;

    return chat;
  } catch (error) {
    console.error("Error fetching chat by id!", error.message);
    return null;
  }
};

module.exports = { fetchUserById, fetchChatById };
