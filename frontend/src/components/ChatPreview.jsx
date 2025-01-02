import React from "react";
import { Link } from "react-router-dom";

function ChatPreview({ id, user, text, time, unreadMessagesCount }) {
  return (
    <Link
      to={`/chats/${id}`}
      className="flex xsm:justify-between h-fit mb-6 w-[90vw] xsm:w-[85vw] lg:w-[65vw] px-2 py-4 xsm:px-6 xsm:py-6 hover:bg-slate-200 dark:hover:bg-slate-700 hover:rounded-3xl hover:cursor-pointer"
    >
      <div className="w-full flex justify-between px-4 py-1">
        <div className="flex justify-center">
          <img
            src={user.image ? user.image : "/images/unknown.jpg"}
            width={100}
            height={100}
            className="max-w-[70px] max-h-[70px] sm:max-w-[100px] sm:max-h-[100px] rounded-full"
            alt=""
          />
          <div className="flex flex-col justify-center ml-5">
            <div className="text-xl sm:text-2xl text-slate-900 dark:text-white">
              {user.username}
            </div>
            <div
              className="text-slate-500 dark:text-slate-400 w-[100%] xsm:w-[80%] text-sm sm:text-base"
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "clamp(10ch, 30vw, 30ch)",
              }}
            >
              {text}
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-center gap-y-2 items-end min-w-[70px]">
          {time && (
            <div className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">
              {new Date(time).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "numeric",
                hour12: true,
              })}
            </div>
          )}

          {unreadMessagesCount !== undefined &&
            unreadMessagesCount !== null &&
            unreadMessagesCount > 0 && (
              <div className="h-8 w-8 sm:h-10 sm:w-10 text-white bg-blue-600 rounded-2xl flex justify-center items-center">
                {unreadMessagesCount}
              </div>
            )}
        </div>
      </div>
    </Link>
  );
}

export default ChatPreview;
