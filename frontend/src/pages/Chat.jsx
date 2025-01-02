import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import { IoIosArrowDown } from "react-icons/io";

import baseUrl from "../config/baseUrl";

import ChatHeader from "../components/ChatHeader";
import Message from "../components/Message";
import ChatInput from "../components/ChatInput";

const ChatPage = () => {
  const { chatId } = useParams();
  const [chat, setChat] = useState();
  const [isTyping, setIsTyping] = useState(false);
  const [newMessage, setNewMessage] = useState(null);
  const [replyToMessage, setReplyToMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isArrowVisible, setIsArrowVisible] = useState(false);
  const [messageTimestamps, setMessageTimestamps] = useState({});

  const focuser = useRef(null);
  const socket = useRef(null);

  const navigate = useNavigate();

  const messageReceivedSound = new Audio("/sounds/messageRcv.wav");
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (newMessage) messageReceivedSound.play();
  }, [newMessage]);

  useEffect(() => {
    fetchChatData();

    socket.current.emit("joinChat", chatId);

    socket.current.on("newMessage", (message) => {
      if (message.author !== userId) setNewMessage(message);

      setChat((prev) => {
        if (prev.messages.some((msg) => msg._id === message._id)) {
          return prev;
        }
        return {
          ...prev,
          messages: [...prev.messages, message],
        };
      });
    });

    socket.current.on("messageDeleted", (messageId) => {
      setChat((prev) => {
        return {
          ...prev,
          messages: prev.messages.filter((msg) => msg._id !== messageId),
        };
      });
    });

    const handleScroll = () => {
      const scrollPosition = window.innerHeight + window.scrollY;
      const bottomThreshold = document.body.offsetHeight - 5;
      const isAtBottom = scrollPosition >= bottomThreshold;
      setIsArrowVisible(!isAtBottom);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      socket.current.emit("leaveChat", chatId);
      socket.current.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [chatId]);

  useEffect(() => {
    socket.current.on("typing", () => {
      setIsTyping(true);
    });

    socket.current.on("stopTyping", () => {
      setIsTyping(false);
    });

    return () => {
      socket.current.off("typing");
      socket.current.off("stopTyping");
    };
  }, []);

  const fetchChatData = async () => {
    try {
      socket.current = io(baseUrl, {
        query: { token },
      });

      setLoading(true);
      const response = await axios.get(`${baseUrl}/chats/${chatId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setChat(response.data.chat);
      socket.current.emit("userActive", response.data.chat.userMe._id);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleTyping = () => {
    socket.current.emit("typing", chatId);
    socket.current.emit("userActive", chat.userMe._id);
  };

  const handleStopTyping = () => {
    socket.current.emit("stopTyping", chatId);
    socket.current.emit("userActive", chat.userMe._id);
  };

  const handleReply = (message) => {
    setReplyToMessage(message);
  };

  const onCancelReply = () => {
    setReplyToMessage(null);
  };

  const handleSendMessage = async (newMessage) => {
    if (newMessage.text.length === 0) return;

    if (replyToMessage) {
      newMessage.replyTo = replyToMessage;
      setReplyToMessage(null);
    }

    try {
      const response = await axios.put(
        `${baseUrl}/messages`,
        {
          chatId: chatId,
          newMessage: newMessage,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const savedMessage = response.data.message;

      socket.current.emit("sendMessage", savedMessage);
      socket.current.emit("userActive", chat.userMe._id);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAutoScroll = () => {
    focuser.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatMessageTimestamp = (timestamp) => {
    const messageDate = new Date(timestamp);
    const currentDate = new Date();

    const isToday =
      messageDate.getDate() === currentDate.getDate() &&
      messageDate.getMonth() === currentDate.getMonth() &&
      messageDate.getFullYear() === currentDate.getFullYear();

    if (isToday)
      return messageDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });

    return messageDate.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  const handleToggleTimestamp = (messageId) => {
    setMessageTimestamps((prev) => ({
      ...prev,
      [messageId]: !prev[messageId],
    }));
  };

  const deleteChat = async () => {
    try {
      const isConfirmed = window.confirm(
        "Are you sure you want to delete this chat?"
      );
      if (!isConfirmed) return;

      await axios.delete(`${baseUrl}/chats/${chatId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      navigate("/chats");
    } catch (error) {
      if (error.response) {
        console.error(error.response.data.message);
      } else {
        console.error("Error deleting chat!", error.message);
      }
    }
  };

  if (!chat || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen dark:bg-gray-800">
        <div className="text-center text-2xl text-gray-700 dark:text-gray-200">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <main className="h-[100%] flex flex-col justify-between bg-white dark:bg-slate-800">
      <div>
        <ChatHeader user={chat.userThem} deleteChat={deleteChat} />
      </div>
      <div className="bg-white dark:bg-slate-800 max-h-auto">
        <div className="flex flex-col w-[100%] xl:w-[95%] mx-auto mt-[85px] sm:mt-[100px] mb-[85px] sm:mb-[110px]">
          {chat.messages.map((message, index) => {
            const showTimestamp =
              messageTimestamps[message._id] ||
              (index === 0 && chat.messages.length === 1) ||
              message.author !== chat.messages[index + 1]?.author;
            return (
              <Message
                key={message._id}
                message={message}
                showTimestamp={showTimestamp}
                toggleTimestamp={() => handleToggleTimestamp(message._id)}
                formatMessageTimestamp={formatMessageTimestamp}
                onReply={handleReply}
              />
            );
          })}
          <div className="fixed bottom-[47px] sm:bottom-[70px] left-4 sm:left-8 right-0">
            {isTyping && (
              <div className="mt-4 mb-3 text-gray-500 dark:text-gray-300 italic">
                {chat.userThem.username.split(" ")[0]} is typing...
              </div>
            )}
          </div>
        </div>

        <span ref={focuser} className="focuser"></span>
      </div>
      {isArrowVisible && (
        <div
          onClick={handleAutoScroll}
          className={`fixed ${
            replyToMessage
              ? "bottom-[92px] sm:bottom-[117px]"
              : "bottom-14 sm:bottom-[73px]"
          } right-[47%] bg-slate-200 text-gray-800 rounded-full p-1 cursor-pointer shadow-md dark:shadow-slate-600 z-50`}
        >
          <IoIosArrowDown size={24} className="text-black" />
        </div>
      )}
      <ChatInput
        handleSendMessage={handleSendMessage}
        handleTyping={handleTyping}
        handleStopTyping={handleStopTyping}
        replyToMessage={replyToMessage}
        onCancelReply={onCancelReply}
      />
    </main>
  );
};

export default ChatPage;
