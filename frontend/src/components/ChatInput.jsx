import React, { useState } from "react";
import { GoPlus } from "react-icons/go";
import { FiSend } from "react-icons/fi";
import { FaTimes } from "react-icons/fa";

function ChatInput({
  handleSendMessage,
  handleTyping,
  handleStopTyping,
  replyToMessage,
  onCancelReply,
}) {
  const [input, setInput] = useState("");
  const [typingTimeout, setTypingTimeout] = useState(null);

  const messageSentSound = new Audio("/sounds/messageSnd.wav");
  const userId = localStorage.getItem("userId");

  const handleInputChange = (e) => {
    const messageText = e.target.value;
    setInput(messageText);

    if (messageText.trim().length > 0) handleTyping();
    else handleStopTyping();

    if (typingTimeout) clearTimeout(typingTimeout);

    const timeout = setTimeout(() => {
      handleStopTyping();
    }, 2000);
    setTypingTimeout(timeout);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 shadow-lg">
      <div className="flex flex-col items-center">
        <div className="bg-transparent">
          {replyToMessage && (
            <div className="mb-2 sm:mb-4 text-gray-800 dark:text-gray-200 rounded-full bg-gray-200 dark:bg-gray-900 py-1 px-4 flex items-center justify-between">
              <span>
                Replying to:{" "}
                {replyToMessage.text.length > 25
                  ? replyToMessage.text.substring(0, 25).concat("...")
                  : replyToMessage.text}
              </span>
              <button
                className="ml-3 w-5 h-5 flex justify-center items-center bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full"
                onClick={onCancelReply}
              >
                <FaTimes size={14} />{" "}
              </button>
            </div>
          )}
        </div>

        <div className="w-screen h-full bg-white dark:bg-slate-800">
          <div className="flex justify-between items-center h-[45px] sm:h-[60px] w-[95%] sm:w-[85%] mx-auto bg-slate-200 dark:bg-slate-600 p-3 rounded-full shadow-md">
            {/* Plus Icon */}
            <div className="flex items-center">
              <GoPlus className="text-white bg-blue-500 rounded-full h-8 w-8 p-2 sm:h-10 sm:w-10 sm:p-2 mr-3 hover:scale-105 transition-all" />
            </div>

            {/* Input Field */}
            <form
              id="message-form"
              className="w-[90%] sm:w-[95%]"
              onSubmit={(e) => {
                e.preventDefault();

                if (input.trim().length > 0) {
                  const newMessage = {
                    text: input,
                    author: userId,
                  };
                  messageSentSound.play();
                  handleSendMessage(newMessage);
                  setInput("");
                  handleStopTyping();
                }
              }}
            >
              <input
                type="text"
                value={input}
                placeholder="Type a message..."
                className="outline-none bg-transparent text-slate-900 dark:text-white h-[40px] sm:h-[45px] w-full text-sm sm:text-base pl-3 pr-10"
                maxLength={130}
                onChange={handleInputChange}
              />
            </form>

            {/* Send Button */}
            <button
              type="submit"
              form="message-form"
              disabled={input.trim().length === 0}
            >
              <FiSend className="text-2xl sm:text-3xl text-blue-500 hover:scale-105 transition-all mr-2 mt-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatInput;
