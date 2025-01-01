import React from "react";
import { Link } from "react-router-dom";

import { IoArrowBack } from "react-icons/io5";
import { IoMdInformationCircleOutline } from "react-icons/io";

function ChatHeader({ user }) {
  return (
    <div className="bg-white dark:bg-slate-800 h-[90px] sm:h-[100px] flex justify-around items-center px-4 text-slate-700 dark:text-white fixed top-0 left-0 right-0 z-[5] outline outline-[7px] md:outline-[10px] outline-white dark:outline-slate-800">
      {/* Back Button */}
      <Link
        to="/chats"
        aria-label="Back to Chats"
        className="hover:text-slate-500 dark:hover:text-slate-300 transition-all"
      >
        <IoArrowBack className="text-3xl dark:text-slate-400" />
      </Link>

      {/* User Info Section */}
      <div className="flex items-center">
        <img
          src={user.image ? user.image : "/images/unknown.jpg"}
          alt=""
          className="rounded-full w-16 h-16 sm:w-20 sm:h-20 border-2 border-slate-400 dark:border-slate-500 shadow-md"
        />
        <div className="ml-4">
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-700 dark:text-white">
            {user.username}
          </h1>
          <h2 className="text-sm text-slate-500 dark:text-slate-400">
            Last seen: 10 minutes ago
          </h2>{" "}
          {/* Sample Date */}
        </div>
      </div>

      {/* Info Button */}
      <Link
        to="#"
        aria-label="Chat Information"
        className="hover:text-slate-500 dark:hover:text-slate-300 transition-all"
      >
        <IoMdInformationCircleOutline className="text-3xl dark:text-slate-400" />
      </Link>
    </div>
  );
}

export default ChatHeader;
