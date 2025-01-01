const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema(
  {
    userMe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userThem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },
    ],
  },
  { timestamps: true }
);

const ChatModel = mongoose.model("Chat", ChatSchema);

module.exports = ChatModel;
