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

    if (newMessage.replyTo) {
      const repliedMessage = await MessageModel.findById(
        newMessage.replyTo._id
      );
      if (!repliedMessage)
        return res.status(404).json({ error: "Replied message not found." });
    }

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
      replyTo: newMessage.replyTo ? newMessage.replyTo._id : null,
    });

    const savedMessage = await message.save();

    chat.messages.push(savedMessage._id);
    await chat.save();

    const populatedMessage = await MessageModel.findById(
      savedMessage._id
    ).populate("replyTo", "text");

    req.io.to(chatId).emit("newMessage", populatedMessage);

    res.status(200).json({ message: populatedMessage });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding message!", error: error.message });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await MessageModel.findById(id);
    if (!message)
      return res.status(404).json({ message: "Message not found!" });

    const chat = await fetchChatById(message.chat);
    if (!chat) return res.status(404).json({ message: "Chat not found!" });

    if (
      req.user._id.toString() !== message.author.toString() &&
      req.user._id.toString() !== chat.userMe.toString() &&
      req.user._id.toString() !== chat.userThem.toString()
    )
      return res.status(403).json({ message: "Unauthorized!" });

    chat.messages.pull(id);
    await chat.save();

    await MessageModel.findByIdAndDelete(id);

    req.io.to(chat._id.toString()).emit("messageDeleted", id);

    res.status(200).json({ message: "Message deleted successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting message!", error: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { chatId, userId } = req.body;

    if (req.user._id.toString() !== userId)
      return res.status(403).json({ message: "Unauthorized!" });

    await MessageModel.updateMany(
      { chat: chatId, author: { $ne: userId }, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({ message: "Messages marked as read!" });
  } catch (error) {
    res.status(500).json({ message: "Error marking messages as read!", error });
  }
};

const reactToMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { reaction } = req.body;
    const userId = req.user._id;

    const message = await MessageModel.findById(id).populate(
      "reactions.user",
      "username image"
    );

    if (!message)
      return res.status(404).json({ message: "Message not found!" });

    const existingReactionIndex = message.reactions.findIndex(
      (r) => r.user._id.toString() === userId.toString()
    );

    if (existingReactionIndex !== -1) {
      const existingReaction = message.reactions[existingReactionIndex];

      if (existingReaction.reaction === reaction) {
        message.reactions.splice(existingReactionIndex, 1);
        await message.save();
        await message.populate("reactions.user", "username image");

        req.io.to(message.chat.toString()).emit("reactionUpdated", {
          messageId: id,
          reactions: message.reactions,
        });
        return res.status(200).json({ message: "Reaction canceled!" });
      } else message.reactions[existingReactionIndex].reaction = reaction;
    } else message.reactions.push({ user: userId, reaction });

    await message.save();
    await message.populate("reactions.user", "username image");

    req.io.to(message.chat.toString()).emit("reactionUpdated", {
      messageId: id,
      reactions: message.reactions,
    });

    res
      .status(200)
      .json({ message: "Reaction updated!", reactions: message.reactions });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating reaction!", error: error.message });
  }
};

module.exports = {
  fetchMessages,
  sendMessage,
  deleteMessage,
  markAsRead,
  reactToMessage,
};
