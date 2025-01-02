import React, { useEffect, useState } from "react";
import { useSwipeable } from "react-swipeable";

function Message({
  message,
  showTimestamp,
  toggleTimestamp,
  formatMessageTimestamp,
  onReply,
}) {
  const [translateX, setTranslateX] = useState(0);

  const { text, createdAt: time, author, replyTo } = message;
  const isUserMessage = author === localStorage.getItem("userId");

  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      if (isUserMessage && eventData.dir === "Left") {
        setTranslateX(Math.max(-50, Math.min(0, eventData.deltaX)));
      } else if (!isUserMessage && eventData.dir === "Right") {
        setTranslateX(Math.min(50, Math.max(0, eventData.deltaX)));
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

      <div
        className={`max-w-full sm:max-w-[80%] px-4 py-3 sm:px-6 sm:py-4 text-sm sm:text-base ${
          isUserMessage
            ? `bg-blue-500 dark:bg-blue-600 text-white rounded-bl-3xl relative shadow-lg ${
                replyTo ? "rounded-tl-3xl" : "rounded-t-3xl"
              }`
            : `bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-white rounded-br-3xl ${
                replyTo ? "rounded-tr-3xl" : "rounded-t-3xl"
              }`
        }`}
        onClick={toggleTimestamp}
      >
        <span className="break-words">{text}</span>
      </div>

      {showTimestamp && (
        <div className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          {formatMessageTimestamp(time)}
        </div>
      )}
    </div>
  );
}

export default Message;
