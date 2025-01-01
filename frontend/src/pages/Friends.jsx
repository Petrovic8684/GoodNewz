import React, { useState, useEffect } from "react";
import axios from "axios";

import baseUrl from "../config/baseUrl";

import { IoIosSearch } from "react-icons/io";

import Footer from "../components/Footer";
import Friend from "../components/Friend";

function FriendsPage() {
  const [data, setData] = useState({
    users: [],
    friends: [],
    sentRequests: [],
    pendingRequests: [],
  });
  const [isSearchActive, setIsSearchActive] = useState(true);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const userId = window.localStorage.getItem("userId");
  const token = window.localStorage.getItem("token");

  useEffect(() => {
    fetchFriendsOverview();
  }, []);

  const fetchFriendsOverview = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseUrl}/friends?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setData(response.data);
    } catch (error) {
      console.error("Error fetching friends overview!", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      const response = await axios.put(
        `${baseUrl}/friends`,
        {
          receiverUserId: userId,
          senderUserId: id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      fetchFriendsOverview();
    } catch (error) {
      console.error(error);
    }
  };

  const handleUnfriend = async (id) => {
    try {
      const response = await axios.delete(`${baseUrl}/friends`, {
        data: {
          receiverUserId: userId,
          senderUserId: id,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchFriendsOverview();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSendRequest = async (id) => {
    try {
      const response = await axios.put(
        `${baseUrl}/requests`,
        {
          receiverUserId: id,
          senderUserId: userId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      fetchFriendsOverview();
    } catch (error) {
      console.error(error);
    }
  };

  const handleReject = async (id) => {
    try {
      const response = await axios.delete(`${baseUrl}/requests`, {
        data: {
          receiverUserId: userId,
          senderUserId: id,
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchFriendsOverview();
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancel = async (id) => {
    try {
      const response = await axios.delete(`${baseUrl}/requests`, {
        data: {
          receiverUserId: id,
          senderUserId: userId,
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchFriendsOverview();
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleUserFilterSearch = () => {
    setIsSearchActive((prevState) => !prevState);
  };

  if (!data || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen dark:bg-gray-800">
        <div className="text-center text-2xl text-gray-700 dark:text-gray-200">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <main className="h-[100vh] pt-[45px] text-center">
      {/* Pending Friend Requests Section */}
      <div
        className={`h-fit mx-10 ${
          data.pendingRequests.length ? "block mb-[65px]" : "hidden"
        }`}
      >
        <h1 className="text-3xl sm:text-5xl font-semibold text-slate-800 dark:text-white mb-4">
          Friend Requests
        </h1>
        <div className="flex flex-col items-center gap-6">
          {data.pendingRequests &&
            data.pendingRequests.map((request) => (
              <Friend
                key={request._id}
                user={request}
                type="pending"
                handleAccept={handleAccept}
                handleUnfriend={handleUnfriend}
                handleSendRequest={handleSendRequest}
                handleCancel={handleCancel}
                handleReject={handleReject}
              />
            ))}
        </div>
      </div>

      {/* Add Friends Section */}
      <div className="h-fit mx-10">
        <h1 className="text-3xl sm:text-5xl font-semibold text-slate-800 dark:text-white">
          Add Friends
        </h1>
        <div className="flex justify-center mt-4">
          <input
            type="text"
            placeholder="Search users..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            hidden={isSearchActive}
            className="w-[200px] bg-white dark:bg-slate-800 outline-none border-b-2 border-slate-700 dark:border-slate-400 mr-4 pb-2 px-2 text-slate-400"
            maxLength={20}
          />
          <span onClick={() => handleToggleUserFilterSearch()}>
            <IoIosSearch className="text-[40px] font-light text-slate-700 dark:text-slate-400 hover:cursor-pointer" />
          </span>
        </div>
        <div className="flex flex-wrap justify-around gap-y-10 mt-8">
          {data.sentRequests &&
            data.sentRequests.map((request) => (
              <Friend
                key={request._id}
                user={request}
                type="sent"
                handleAccept={handleAccept}
                handleUnfriend={handleUnfriend}
                handleSendRequest={handleSendRequest}
                handleCancel={handleCancel}
                handleReject={handleReject}
              />
            ))}
          {data.users &&
            data.users.map((user) => (
              <Friend
                key={user._id}
                user={user}
                type="user"
                handleAccept={handleAccept}
                handleUnfriend={handleUnfriend}
                handleSendRequest={handleSendRequest}
                handleCancel={handleCancel}
                handleReject={handleReject}
              />
            ))}
        </div>
      </div>

      {/* Friends Section */}
      <div className="h-fit mx-10 pb-[110px] mt-10">
        <h1 className="text-3xl sm:text-5xl font-semibold text-slate-800 dark:text-white">
          Friends
        </h1>
        {data.friends.length === 0 ? (
          <h2 className="text-lg text-slate-500 dark:text-slate-400 mt-6 mb-16">
            Looks like you have not added any friends yet!
          </h2>
        ) : (
          <div className="flex flex-wrap justify-around gap-y-10 mt-16">
            {data.friends &&
              data.friends.map((friend) => (
                <Friend
                  key={friend._id}
                  user={friend}
                  type="friend"
                  handleAccept={handleAccept}
                  handleUnfriend={handleUnfriend}
                  handleSendRequest={handleSendRequest}
                  handleCancel={handleCancel}
                  handleReject={handleReject}
                />
              ))}
          </div>
        )}
      </div>

      <Footer activePage="friends" />
    </main>
  );
}

export default FriendsPage;
