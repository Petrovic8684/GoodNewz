import React, { useState, useEffect, useMemo } from "react";
import api from "../config/api";
import { IoIosSearch } from "react-icons/io";
import { GoPlus } from "react-icons/go";
import ChatPreview from "../components/ChatPreview";
import MainFooter from "../components/Footer";
import Friend from "../components/Friend";
import { useNavigate } from "react-router-dom";

const ChatsPage = () => {
  const [chats, setChats] = useState([]);
  const [friends, setFriends] = useState([]);
  const [isSearchActive, setIsSearchActive] = useState(true);
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState({ chats: true, friends: true });

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const navigate = useNavigate();

  useEffect(() => {
    fetchChats();
    fetchFriends();
  }, []);

  const fetchChats = async () => {
    try {
      setLoading((prev) => ({ ...prev, chats: true }));
      const response = await api.get(`/chats?userId=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setChats(response.data.chats);
    } catch (error) {
      console.error("Something went wrong while fetching your chats!", error);
    } finally {
      setLoading((prev) => ({ ...prev, chats: false }));
    }
  };

  const fetchFriends = async () => {
    try {
      setLoading((prev) => ({ ...prev, friends: true }));
      const response = await api.get(`/friends?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFriends(response.data.friends);
    } catch (error) {
      console.error("Error fetching friends overview!", error);
    } finally {
      setLoading((prev) => ({ ...prev, friends: false }));
    }
  };

  const filteredChats = useMemo(() => {
    const searchQuery = query.toLowerCase().trim();
    return chats.filter((chat) =>
      chat?.userThem.username.toLowerCase().includes(searchQuery)
    );
  }, [query, chats]);

  const handleToggleChatFilterSearch = () => {
    setIsSearchActive((prevState) => !prevState);
  };

  const handleOpenChat = async (friendId) => {
    try {
      const response = await api.post(
        `/chats`,
        {
          userMeId: userId,
          userThemId: friendId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate(response.data.chatId);
    } catch (error) {
      console.error("Error fetching friends overview!", error);
    } finally {
      setIsModalOpen(false);
    }
  };

  if (
    !chats ||
    !friends ||
    loading.chats ||
    loading.friends ||
    !filteredChats
  ) {
    return (
      <div className="flex items-center justify-center min-h-screen dark:bg-gray-800">
        <div className="text-center text-2xl text-gray-700 dark:text-gray-200">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <main className="flex flex-col justify-between tracking-wide h-full bg-white dark:bg-slate-800">
      <div>
        <div className="flex flex-col sm:flex-row justify-around items-center mt-[45px] mb-[25px] sm:mb-[80px]">
          <h1 className="text-4xl sm:text-5xl font-semibold text-slate-800 dark:text-white">
            Messages
          </h1>
          <div className="flex mt-3 sm:mt-0">
            <input
              type="text"
              placeholder="Filter chats..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              hidden={isSearchActive}
              className="w-[200px] lg:w-[100%] bg-white dark:bg-slate-800 outline-none border-b-2 border-slate-700 dark:border-slate-400 mr-4 pb-2 px-2 text-slate-400"
              maxLength={20}
            />
            <span onClick={() => handleToggleChatFilterSearch()}>
              <IoIosSearch className="text-[40px] font-light text-slate-700 dark:text-slate-400 hover:cursor-pointer" />
            </span>
          </div>
        </div>

        {chats.length === 0 ? (
          <h1 className="h-[50vh] mx-[30px] text-center text-lg sm:text-xl text-slate-500 dark:text-slate-400 mt-6 mb-16 flex justify-center items-center">
            Looks like you do not have any chats yet!
          </h1>
        ) : (
          <div className="flex flex-col items-center mx-10 mb-20">
            {filteredChats.map((chat) => (
              <ChatPreview
                key={chat._id}
                id={chat._id}
                user={chat.userMe._id === userId ? chat.userThem : chat.userMe}
                text={chat.messages[chat.messages.length - 1]?.text}
                time={chat.messages[chat.messages.length - 1]?.createdAt}
                unreadMessagesCount={chat.unreadMessagesCount}
              />
            ))}
          </div>
        )}
      </div>

      <div onClick={() => setIsModalOpen(true)} className="cursor-pointer">
        <GoPlus className="fixed bottom-[100px] sm:bottom-[110px] lg:bottom-[130px] right-[10vw] z-[100] text-7xl text-white bg-pink-500 rounded-full p-[20px] hover:bg-pink-600 transition-all duration-300" />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[200]">
          <div className="bg-white dark:bg-slate-700 w-[90%] sm:w-[50%] max-h-[80%] rounded-lg overflow-y-auto p-6">
            <h2 className="text-2xl text-slate-800 dark:text-white mb-4">
              Friends
            </h2>
            {friends.map((friend) => (
              <Friend
                key={friend._id}
                user={friend}
                type="chattable"
                handleOpenChat={handleOpenChat}
              />
            ))}
            <button
              className="mt-4 p-2 bg-red-600 text-white rounded"
              onClick={() => setIsModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <MainFooter activePage="chats" />
    </main>
  );
};

export default ChatsPage;
