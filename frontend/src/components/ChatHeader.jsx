import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { io } from "socket.io-client";
import baseUrl from "../config/baseUrl";
import getLastSeen from "../utilities/lastSeenUtility";

function ChatHeader({ user }) {
  const socket = useRef(null);
  const [lastSeen, setLastSeen] = useState(user.lastSeen);
  const lastSeenInterval = useRef(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    socket.current = io(baseUrl, {
      query: { token },
    });

    const updateLastSeen = ({ userId, lastSeen }) => {
      if (userId === user._id) {
        setLastSeen(lastSeen);
        resetInactivityInterval();
      }
    };

    socket.current.on("lastSeenUpdate", updateLastSeen);

    const resetInactivityInterval = () => {
      if (lastSeenInterval.current) clearInterval(lastSeenInterval.current);

      lastSeenInterval.current = setInterval(() => {
        setLastSeen((prevLastSeen) => {
          return new Date(prevLastSeen);
        });
      }, 60 * 1000);
    };

    resetInactivityInterval();

    return () => {
      socket.current.off("lastSeenUpdate", updateLastSeen);
      socket.current.disconnect();
      if (lastSeenInterval.current) clearInterval(lastSeenInterval.current);
    };
  }, [user]);

  return (
    <div className="w-screen bg-white dark:bg-slate-800 h-[65px] sm:h-[80px] flex justify-around items-center px-4 text-slate-700 dark:text-white fixed top-0 left-0 right-0 z-[5] outline outline-[7px] md:outline-[10px] outline-white dark:outline-slate-800">
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
          className="rounded-full w-12 h-12 sm:w-16 sm:h-16 border-2 border-slate-400 dark:border-slate-500 shadow-md"
        />
        <div className="ml-4">
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-700 dark:text-white">
            {user.username}
          </h1>
          <div className="flex items-center space-x-2">
            <span
              className={`mt-[1.5px] w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                getLastSeen(lastSeen).isActive ? "bg-green-500" : "bg-gray-400"
              }`}
            ></span>
            <h2 className="text-sm text-slate-500 dark:text-slate-400">
              {getLastSeen(lastSeen).text}
            </h2>
          </div>
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
