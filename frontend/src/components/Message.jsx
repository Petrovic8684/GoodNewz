import React from "react";

function Message({
  text,
  time,
  author,
  showTimestamp,
  toggleTimestamp,
  formatMessageTimestamp,
}) {
  const isUserMessage = author === localStorage.getItem("userId");

  return (
    <div
      className={`mb-1.5 px-4 sm:px-8 flex flex-col ${
        isUserMessage ? "items-end" : "items-start"
      }`}
    >
      <div
        className={`max-w-full sm:max-w-[80%] px-4 py-3 sm:px-6 sm:py-4 text-sm sm:text-base rounded-t-3xl ${
          isUserMessage
            ? "bg-blue-500 dark:bg-blue-600 text-white rounded-bl-3xl relative shadow-lg"
            : "bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-white rounded-br-3xl"
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
