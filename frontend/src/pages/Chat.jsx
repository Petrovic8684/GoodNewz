import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";

import baseUrl from "../config/baseUrl";

import ChatHeader from "../components/ChatHeader";
import Message from "../components/Message";
import ChatInput from "../components/ChatInput";

const ChatPage = () => {
  const { chatId } = useParams();
  const [chat, setChat] = useState();
  const [isTyping, setIsTyping] = useState(false);
  const [newMessage, setNewMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  const focuser = useRef(null);
  const socket = useRef(null);

  const messageReceivedSound = new Audio("/sounds/messageRcv.wav");
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const [messageTimestamps, setMessageTimestamps] = useState({});

  useEffect(() => {
    handleAutoScroll();
  }, [chat?.messages]);

  useEffect(() => {
    if (newMessage) messageReceivedSound.play();
  }, [newMessage]);

  useEffect(() => {
    fetchChatData();

    socket.current = io(baseUrl, {
      query: { token },
    });

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
      handleAutoScroll();
    });

    return () => {
      socket.current.emit("leaveChat", chatId);
      socket.current.disconnect();
    };
  }, [chatId]);

  useEffect(() => {
    socket.current.on("typing", () => {
      setIsTyping(true);
      handleAutoScroll();
    });

    socket.current.on("stopTyping", () => {
      setIsTyping(false);
      handleAutoScroll();
    });

    return () => {
      socket.current.off("typing");
      socket.current.off("stopTyping");
    };
  }, []);

  const fetchChatData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseUrl}/chats/${chatId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setChat(response.data.chat);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleTyping = () => {
    socket.current.emit("typing", chatId);
  };

  const handleStopTyping = () => {
    socket.current.emit("stopTyping", chatId);
  };

  const handleSendMessage = async (newMessage) => {
    if (newMessage.text.length === 0) {
      return;
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
        <ChatHeader user={chat.userThem} />
      </div>
      <div className="bg-white dark:bg-slate-800 max-h-auto">
        <div className="flex flex-col w-[100%] xl:w-[95%] mx-auto mb-16 mt-[125px] sm:mt-[150px] mb-[90px] sm:mb-[120px]">
          {chat.messages.map((message, index) => {
            const showTimestamp =
              messageTimestamps[message._id] ||
              index === 0 ||
              message.author !== chat.messages[index + 1]?.author;
            return (
              <Message
                key={message._id}
                text={message.text}
                time={message.createdAt}
                author={message.author}
                showTimestamp={showTimestamp}
                toggleTimestamp={() => handleToggleTimestamp(message._id)}
                formatMessageTimestamp={formatMessageTimestamp}
              />
            );
          })}
          <div className="flex justify-start items-center px-4">
            {isTyping && (
              <div className="my-6 text-gray-500 dark:text-gray-300 italic">
                {chat.userThem.username.split(" ")[0]} is typing...
              </div>
            )}
          </div>
        </div>

        <span ref={focuser} className="focuser"></span>
      </div>
      <ChatInput
        handleSendMessage={handleSendMessage}
        handleAutoScroll={handleAutoScroll}
        handleTyping={handleTyping}
        handleStopTyping={handleStopTyping}
      />
    </main>
  );
};

export default ChatPage;
