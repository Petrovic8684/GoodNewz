import React, { useState, useRef } from "react";
import ReactDOM from "react-dom";
import api from "../config/api";
import baseUrl from "../config/baseUrl";
import { RiDeleteBinLine } from "react-icons/ri";
import { FaRegSmile } from "react-icons/fa";
import { useSwipeable } from "react-swipeable";
import { io } from "socket.io-client";

function ReactionModal({ reactions, isOpen, onClose }) {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <>
      <div className="fixed inset-0 bg-gray-800 bg-opacity-50 z-50"></div>

      <div className="modal fixed w-[80%] sm:w-[70%] md:w-[50%] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[100]">
        <div className="flex flex-col items-start mx-4 bg-gray-100 dark:bg-gray-700 p-6 rounded-lg shadow-lg max-w-4xl w-full">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            Reactions
          </h2>
          <ul className="w-full">
            {reactions.map((reaction, index) => (
              <li
                key={index}
                className="w-full flex items-center space-x-2 mb-2 border-b dark:border-gray-600 pb-2"
              >
                <div className="w-full flex items-center gap-x-3">
                  <img
                    src={
                      reaction.user.image
                        ? reaction.user.image
                        : "images/unknown.jpg"
                    }
                    alt=""
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="font-semibold text-gray-500 dark:text-gray-400 italic">
                    {reaction.user.username}
                  </span>
                </div>
                <span>{reaction.reaction}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Close
          </button>
        </div>
      </div>
    </>,
    document.body
  );
}

function ReactionPopup({
  reactions,
  onReactionClick,
  parentRef,
  isUserMessage,
  currentUserReaction,
}) {
  if (!parentRef.current) return null;

  const parentRect = parentRef.current.getBoundingClientRect();

  return ReactDOM.createPortal(
    <div
      className="absolute bg-gray-200 dark:bg-slate-600 p-2 rounded shadow-lg"
      style={{
        top: parentRect.bottom + window.scrollY + 10,
        left: parentRect.left + window.scrollX - (isUserMessage ? 215 : 0),
      }}
    >
      {reactions.map((reaction) => {
        const isCurrentUserReaction = reaction === currentUserReaction;

        return (
          <span
            key={reaction}
            className={`cursor-pointer text-lg mx-1 p-1.5 ${
              isCurrentUserReaction
                ? "bg-gray-300 dark:bg-gray-700 text-white rounded-full"
                : ""
            }`}
            onClick={() => onReactionClick(reaction)}
          >
            {reaction}
          </span>
        );
      })}
    </div>,
    document.body
  );
}

function Message({
  message,
  showTimestamp,
  toggleTimestamp,
  formatMessageTimestamp,
  onReply,
}) {
  const [translateX, setTranslateX] = useState(0);
  const [showOptions, setShowOptions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const smileRef = useRef(null);

  const { text, createdAt: time, author, replyTo, reactions } = message;

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const isUserMessage = author === userId;
  const currentUserReaction = reactions.find(
    (reaction) => reaction.user._id.toString() === userId
  )?.reaction;

  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      if (!showOptions) {
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
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  const handleReaction = async (reaction) => {
    try {
      await api.post(
        `/messages/${message._id}/react`,
        { reaction },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const socket = io(baseUrl, { query: { token } });
      socket.emit("messageReacted", {
        messageId: message._id,
        reaction,
      });

      socket.emit("userActive", userId);

      setShowReactions(false);
    } catch (error) {
      console.error("Error adding reaction:", error.message);
    }
  };

  const deleteMessage = async () => {
    if (!isUserMessage) return;

    try {
      const isConfirmed = window.confirm(
        "Are you sure you want to delete this message?"
      );
      if (!isConfirmed) return;

      await api.delete(`/messages/${message._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const socket = io(baseUrl, { query: { token } });
      socket.emit("messageDeleted", {
        messageId: message._id,
      });
      socket.emit("userActive", userId);

      setShowOptions(false);
    } catch (error) {
      console.error("Error deleting message!", error.message);
    }
  };

  return (
    <div
      className={`mb-1.5 px-4 sm:px-8 flex flex-col relative ${
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
      <div
        className={`flex ${
          isUserMessage ? "flex-row" : "flex-row-reverse"
        } items-center max-w-[70%] sm:max-w-[60%] gap-x-4`}
      >
        {showOptions && isUserMessage && (
          <div
            onClick={deleteMessage}
            className="cursor-pointer text-red-600 dark:text-red-500"
          >
            <RiDeleteBinLine size={20} />
          </div>
        )}
        {showOptions && (
          <div ref={smileRef} className="relative">
            <FaRegSmile
              size={20}
              className="cursor-pointer text-yellow-500"
              onClick={() => setShowReactions(!showReactions)}
            />
            {showReactions && (
              <ReactionPopup
                reactions={["👍", "👎", "❤️", "😂", "😢"]}
                onReactionClick={handleReaction}
                parentRef={smileRef}
                isUserMessage={isUserMessage}
                currentUserReaction={currentUserReaction}
              />
            )}
          </div>
        )}
        <div>
          <div
            {...handlers}
            className={`relative px-4 py-3 sm:px-6 sm:py-4 text-sm sm:text-base ${
              isUserMessage
                ? `bg-blue-500 dark:bg-blue-600 text-white rounded-bl-3xl shadow-lg ${
                    replyTo ? "rounded-tl-3xl" : "rounded-t-3xl"
                  }`
                : `bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-white rounded-br-3xl ${
                    replyTo ? "rounded-tr-3xl" : "rounded-t-3xl"
                  }`
            }`}
            onClick={() => {
              setShowOptions((prevShowOptions) => !prevShowOptions);
              toggleTimestamp();
            }}
          >
            <span className="break-words">{text}</span>

            {reactions && reactions.length > 0 && (
              <div
                className={`absolute bg-white dark:bg-slate-800 dark:shadow-none sm:w-7 sm:h-7 rounded-xl shadow-lg ${
                  isUserMessage
                    ? "bottom-[-5px] right-[-5px]"
                    : "bottom-[-5px] left-[-5px]"
                } flex justify-center items-center cursor-pointer`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsModalOpen(true);
                }}
              >
                <span>{reactions[0].reaction}</span>
                {reactions.length > 1 && (
                  <span className="text-xs text-gray-800 dark:text-gray-200">
                    {reactions.length}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {showTimestamp && (
        <div className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          {formatMessageTimestamp(time)}
        </div>
      )}
      <ReactionModal
        reactions={reactions}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

export default Message;
