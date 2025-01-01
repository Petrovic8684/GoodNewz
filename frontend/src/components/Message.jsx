import React from "react";

function Message({ text, time, author }) {
  const isUserMessage = author === window.localStorage.getItem("userId");

  return (
    <div
      className={`mb-6 sm:mb-4 px-4 sm:px-8 flex flex-col ${
        isUserMessage ? "items-end" : "items-start"
      }`}
    >
      <div
        className={`max-w-full sm:max-w-[80%] px-4 py-3 sm:px-6 sm:py-4 text-sm sm:text-base rounded-t-3xl ${
          isUserMessage
            ? "bg-blue-500 dark:bg-blue-600 text-white rounded-bl-3xl relative shadow-lg"
            : "bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-white rounded-br-3xl"
        }`}
      >
        <span className="break-words">{text}</span>
      </div>

      <div className="mt-2 sm:mt-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
        {new Date(time).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        })}
      </div>
    </div>
  );
}

export default Message;
