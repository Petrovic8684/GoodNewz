import React, { useState, useEffect } from "react";
import { GoPlus } from "react-icons/go";
import { FiSend } from "react-icons/fi";

function ChatInput({
  handleSendMessage,
  handleAutoScroll,
  handleTyping,
  handleStopTyping,
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
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 shadow-lg min-h-[65px] sm:min-h-[75px] flex justify-center items-center p-2 sm:p-4">
      <div className="flex justify-between items-center h-[50px] sm:h-[60px] w-[95%] sm:w-[85%] mx-auto bg-slate-200 dark:bg-slate-600 p-3 rounded-full shadow-md">
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
            onFocus={() => handleAutoScroll()}
            onChange={handleInputChange}
          />
        </form>

        {/* Send Button */}
        <button
          type="submit"
          form="message-form"
          disabled={input.trim().length === 0}
        >
          <FiSend className="text-2xl sm:text-3xl text-blue-500 dark:text-blue-400 hover:scale-105 transition-all mr-4" />
        </button>
      </div>
    </div>
  );
}

export default ChatInput;
