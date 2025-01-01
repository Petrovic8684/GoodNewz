const MessageModel = require("../models/messageModel");
const { fetchChatById } = require("../utilities/fetchUtility");

const fetchMessages = async (req, res) => {
  try {
    const chat = await fetchChatById(req.query.chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found!" });

    if (
      req.user._id.toString() !== chat.userMe._id.toString() &&
      req.user._id.toString() !== chat.userThem._id.toString()
    )
      return res.status(403).json({ message: "Unauthorized!" });

    res.status(200).json({ messages: chat.messages });
  } catch (error) {
    res.status(404).json({ message: "Chat not found!", error: error.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { chatId, newMessage } = req.body;

    if (!newMessage || newMessage.text.length === 0)
      return res.status(400).json({ message: "Invalid message text!" });

    const chat = await fetchChatById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found!" });

    if (
      req.user._id.toString() !== chat.userMe._id.toString() &&
      req.user._id.toString() !== chat.userThem._id.toString()
    )
      return res.status(403).json({ message: "Unauthorized!" });

    const message = new MessageModel({
      text: newMessage.text,
      author: newMessage.author,
      chat: chat._id,
    });

    const savedMessage = await message.save();

    chat.messages.push(savedMessage._id);
    await chat.save();

    req.io.to(chatId).emit("newMessage", savedMessage);

    res.status(200).json({ message: savedMessage });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding message!", error: error.message });
  }
};

module.exports = { fetchMessages, sendMessage };
