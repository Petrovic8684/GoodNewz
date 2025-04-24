const ChatModel = require("../models/chatModel");
const MessageModel = require("../models/messageModel");
const { fetchUserById, fetchChatById } = require("../utilities/fetchUtility");

const fetchChats = async (req, res) => {
  try {
    const userId = req.query.userId;

    if (req.user._id.toString() !== userId)
      return res.status(403).json({ message: "Unauthorized!" });

    if (!fetchUserById(userId))
      return res.status(404).json({ message: "User not found!" });

    const chats = await ChatModel.find({
      $or: [{ userMe: userId }, { userThem: userId }],
    })
      .populate("userMe", "username image")
      .populate("userThem", "username image")
      .populate("messages", "text author createdAt read");

    const updatedChats = await Promise.all(
      chats.map(async (chat) => {
        const oneMinuteLater = new Date(
          req.user.lastSeen.getTime() + 60 * 1000
        );
        const unreadMessagesCount = await MessageModel.countDocuments({
          chat: chat._id,
          createdAt: { $gt: oneMinuteLater },
          read: false,
        });

        return {
          ...chat.toObject(),
          unreadMessagesCount,
        };
      })
    );

    res.status(200).json({ chats: updatedChats });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error finding chats!", error: error.message });
  }
};

const fetchChat = async (req, res) => {
  try {
    const { id } = req.params;

    const chat = await fetchChatById(id);
    if (!chat) return res.status(404).json({ message: "Chat not found!" });

    if (
      req.user._id.toString() !== chat.userMe._id.toString() &&
      req.user._id.toString() !== chat.userThem._id.toString()
    )
      return res.status(403).json({ message: "Unauthorized!" });

    if (chat.userThem._id.toString() === req.user._id.toString()) {
      const temp = chat.userThem;
      chat.userThem = chat.userMe;
      chat.userMe = temp;
    }

    res.status(200).json({ chat });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error finding chats!", error: error.message });
  }
};

const createChat = async (req, res) => {
  try {
    const { userMeId, userThemId } = req.body;

    if (
      req.user._id.toString() !== userMeId &&
      req.user._id.toString() !== userThemId
    )
      return res.status(403).json({ message: "Unauthorized!" });

    if (!fetchUserById(userMeId) || !fetchUserById(userThemId))
      res.status(404).json({ message: "User not found!" });

    const existingChat = await ChatModel.findOne({
      $or: [
        { userMe: userMeId, userThem: userThemId },
        { userMe: userThemId, userThem: userMeId },
      ],
    });

    if (existingChat) return res.status(200).json({ chatId: existingChat._id });

    const me = await fetchUserById(userMeId);
    if (!me.friends.some((friend) => friend._id.toString() === userThemId))
      return res.status(400).json({ message: "Users are not friends!" });

    const newChat = new ChatModel({
      userMe: userMeId,
      userThem: userThemId,
      messages: [],
    });

    await newChat.save();
    res.status(201).json({ chatId: newChat._id });
  } catch (error) {
    res.status(500).json({
      message: "Error creating or retrieving chat!",
      error: error.message,
    });
  }
};

const deleteChat = async (req, res) => {
  try {
    const { id } = req.params;

    const chat = await fetchChatById(id);
    if (!chat) return res.status(404).json({ message: "Chat not found!" });

    if (
      req.user._id.toString() !== chat.userMe._id.toString() &&
      req.user._id.toString() !== chat.userThem._id.toString()
    )
      return res.status(403).json({ message: "Unauthorized!" });

    await MessageModel.deleteMany({ chat: id });
    await ChatModel.findByIdAndDelete(id);

    req.io.to(id).emit("chatDeleted", req.user._id);

    res.status(200).json({ message: "Chat deleted successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting chat!", error: error.message });
  }
};

module.exports = { fetchChats, fetchChat, createChat, deleteChat };
