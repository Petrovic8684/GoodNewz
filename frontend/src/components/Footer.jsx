import React from "react";
import { Link } from "react-router-dom";
import { FaRegMessage } from "react-icons/fa6";
import { FaRegUser } from "react-icons/fa";
import { LuSettings } from "react-icons/lu";

function Footer({ activePage, isModalOpen }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-transparent w-full h-[70px] sm:h-[80px] xl:h-[90px] text-slate-800 dark:text-white">
      <div className="w-full max-w-5xl mx-auto flex justify-around items-center h-full px-4 sm:px-8">
        {/* Chats */}
        {isModalOpen ? (
          <div
            to={"/chats"}
            className={`flex flex-col justify-center items-center relative ${
              activePage === "chats"
                ? "text-blue-600 dark:text-blue-400"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            <FaRegMessage
              className={`text-[28px] sm:text-[32px] transition-all duration-300`}
            />
          </div>
        ) : (
          <Link
            to={"/chats"}
            className={`flex flex-col justify-center items-center relative ${
              activePage === "chats"
                ? "text-blue-600 dark:text-blue-400"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            <FaRegMessage
              className={`text-[28px] sm:text-[32px] transition-all duration-300 hover:text-blue-600 hover:dark:text-blue-400`}
            />
          </Link>
        )}

        {/* Friends */}
        {isModalOpen ? (
          <div
            to={"/friends"}
            className={`flex flex-col justify-center items-center relative ${
              activePage === "friends"
                ? "text-blue-600 dark:text-blue-400"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            <FaRegUser
              className={`text-[28px] sm:text-[32px] transition-all duration-300`}
            />
          </div>
        ) : (
          <Link
            to={"/friends"}
            className={`flex flex-col justify-center items-center relative ${
              activePage === "friends"
                ? "text-blue-600 dark:text-blue-400"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            <FaRegUser
              className={`text-[28px] sm:text-[32px] transition-all duration-300 hover:text-blue-600 hover:dark:text-blue-400`}
            />
          </Link>
        )}

        {/* Settings */}
        {isModalOpen ? (
          <div
            to={"/settings"}
            className={`flex flex-col justify-center items-center relative ${
              activePage === "settings"
                ? "text-blue-600 dark:text-blue-400"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            <LuSettings
              className={`text-[28px] sm:text-[32px] transition-all duration-300`}
            />
          </div>
        ) : (
          <Link
            to={"/settings"}
            className={`flex flex-col justify-center items-center relative ${
              activePage === "settings"
                ? "text-blue-600 dark:text-blue-400"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            <LuSettings
              className={`text-[28px] sm:text-[32px] transition-all duration-300 hover:text-blue-600 hover:dark:text-blue-400`}
            />
          </Link>
        )}
      </div>
    </div>
  );
}

export default Footer;
