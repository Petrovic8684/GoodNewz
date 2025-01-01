import React from "react";

function Friend({
  user,
  type,
  handleAccept,
  handleUnfriend,
  handleSendRequest,
  handleCancel,
  handleReject,
  handleOpenChat,
}) {
  const { _id, username, image } = user;

  return (
    <div className="flex items-center">
      <img
        src={image || "/images/unknown.jpg"}
        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full"
        alt=""
      />
      <div className="flex flex-col pl-4">
        <h2 className="text-slate-800 dark:text-slate-400">{username}</h2>
        {type === "friend" ? (
          <button className="text-red-600" onClick={() => handleUnfriend(_id)}>
            Unfriend
          </button>
        ) : type === "pending" ? (
          <div>
            <button
              className="text-red-600 mr-2"
              onClick={() => handleReject(_id)}
            >
              Reject
            </button>
            <button className="text-blue-600" onClick={() => handleAccept(_id)}>
              Accept
            </button>
          </div>
        ) : type === "user" ? (
          <button
            className="text-blue-600"
            onClick={() => handleSendRequest(_id)}
          >
            Add Friend
          </button>
        ) : type === "sent" ? (
          <button className="text-red-600" onClick={() => handleCancel(_id)}>
            Unsend
          </button>
        ) : (
          <button
            className="text-green-600"
            onClick={() => handleOpenChat(_id)}
          >
            Open chat
          </button>
        )}
      </div>
    </div>
  );
}

export default Friend;
