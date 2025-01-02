import React, { useState, useRef } from "react";
import axios from "axios";
import baseUrl from "../config/baseUrl";
import { RiDeleteBinLine } from "react-icons/ri";
import { useSwipeable } from "react-swipeable";
import { io } from "socket.io-client";

function Message({
  message,
  showTimestamp,
  toggleTimestamp,
  formatMessageTimestamp,
  onReply,
}) {
  const [translateX, setTranslateX] = useState(0);
  const [showTrash, setShowTrash] = useState(false);

  const { text, createdAt: time, author, replyTo } = message;

  const token = localStorage.getItem("token");
  const isUserMessage = author === localStorage.getItem("userId");

  const socket = useRef(null);

  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      if (!showTrash) {
        if (isUserMessage && eventData.dir === "Left") {
          setTranslateX(Math.max(-50, Math.min(0, eventData.deltaX)));
        } else if (!isUserMessage && eventData.dir === "Right") {
          setTranslateX(Math.min(50, Math.max(0, eventData.deltaX)));
        }
      }
    },
    onSwiped: () => {
      if (
        (isUserMessage && translateX < -30) ||
        (!isUserMessage && translateX > 30)
      ) {
        onReply(message);
      }
      setTranslateX(0);
    },
    onTap: (eventData) => {
      if (eventData.event.target.closest(".message-container")) {
        setShowTrash((prevShowTrash) => !prevShowTrash);
        toggleTimestamp();
      }
    },

    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  const deleteMessage = async () => {
    if (!isUserMessage) return;

    try {
      const isConfirmed = window.confirm(
        "Are you sure you want to delete this message?"
      );
      if (!isConfirmed) return;

      await axios.delete(`${baseUrl}/messages/${message._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      socket.current = io(baseUrl, {
        query: { token },
      });

      socket.current.emit("messageDeleted", message._id);

      setShowTrash(false);
    } catch (error) {
      if (error.response) {
        console.error(error.response.data.message);
      } else {
        console.error("Error deleting message!", error.message);
      }
    }
  };

  return (
    <div
      {...handlers}
      className={`mb-1.5 px-4 sm:px-8 flex flex-col ${
        isUserMessage ? "items-end" : "items-start"
      }`}
      style={{
        transform: `translateX(${translateX}px)`,
        transition: "transform 0.2s ease-out",
      }}
    >
      {replyTo && (
        <div
          className={`mt-3 text-sm sm:text-base py-2 px-4 ${
            isUserMessage
              ? "bg-gray-200 text-gray-800 dark:bg-gray-900 dark:text-gray-300 rounded-l-xl rounded-tr-xl"
              : "bg-blue-200 text-gray-800 dark:bg-blue-800 dark:text-gray-100 rounded-r-xl rounded-tl-xl"
          }`}
        >
          {replyTo.text.length > 30
            ? replyTo.text.substring(0, 30).concat("...")
            : replyTo.text}
        </div>
      )}
      <div className="flex items-center max-w-[70%] sm:max-w-[60%]">
        {showTrash && isUserMessage && (
          <div
            onClick={deleteMessage}
            className="delete-trash cursor-pointer text-red-600 dark:text-red-500 mr-3 mb-4"
          >
            <RiDeleteBinLine size={20} />
          </div>
        )}
        <div
          className={`w-full flex flex-col ${
            isUserMessage ? "items-end" : "items-start"
          }`}
        >
          <div
            className={`message-container px-4 py-3 sm:px-6 sm:py-4 text-sm sm:text-base ${
              isUserMessage
                ? `bg-blue-500 dark:bg-blue-600 text-white rounded-bl-3xl relative shadow-lg ${
                    replyTo ? "rounded-tl-3xl" : "rounded-t-3xl"
                  }`
                : `bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-white rounded-br-3xl ${
                    replyTo ? "rounded-tr-3xl" : "rounded-t-3xl"
                  }`
            }`}
          >
            <span className="break-words">{text}</span>
          </div>
          {showTimestamp && (
            <div className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {formatMessageTimestamp(time)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Message;
