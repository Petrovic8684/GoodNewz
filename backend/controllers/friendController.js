const UserModel = require("../models/userModel");
const { fetchUserById } = require("../utilities/fetchUtility");

const fetchFriendsOverview = async (req, res) => {
  try {
    if (req.user._id.toString() !== req.query.userId)
      return res.status(403).json({ message: "Unauthorized!" });

    const user = await fetchUserById(req.query.userId);
    if (!user) return res.status(404).json({ message: "User not found!" });

    // Dohvati sve korisnike osim trenutnog
    const allUsers = await UserModel.find({ _id: { $ne: req.user._id } });

    // Podeli korisnike u kategorije
    const friends = user.friends || [];
    const sentRequests = user.sentRequests || [];
    const pendingRequests = user.pendingRequests || [];
    const potentialUsers = allUsers.filter(
      (otherUser) =>
        !friends.some(
          (friend) => friend._id.toString() === otherUser._id.toString()
        ) &&
        !sentRequests.some(
          (request) => request._id.toString() === otherUser._id.toString()
        ) &&
        !pendingRequests.some(
          (request) => request._id.toString() === otherUser._id.toString()
        )
    );

    res.status(200).json({
      users: potentialUsers,
      friends,
      sentRequests,
      pendingRequests,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching friends overview!",
      error: error.message,
    });
  }
};

const addFriend = async (req, res) => {
  try {
    const { senderUserId, receiverUserId } = req.body;

    if (req.user._id.toString() !== receiverUserId)
      return res.status(403).json({ message: "Unauthorized!" });

    const receiver = await fetchUserById(receiverUserId);
    const sender = await fetchUserById(senderUserId);

    if (!sender) return res.status(404).json({ message: "Sender not found!" });

    if (!receiver)
      return res.status(404).json({ message: "Receiver not found!" });

    if (
      receiver.friends.some((friend) => friend._id.toString() === senderUserId)
    )
      return res.status(400).json({ message: "Users already friends!" });

    if (
      !receiver.pendingRequests.some(
        (request) => request._id.toString() === senderUserId
      )
    )
      return res.status(400).json({ message: "Request not found!" });

    receiver.pendingRequests = receiver.pendingRequests.filter(
      (request) => request._id.toString() !== senderUserId
    );
    sender.sentRequests = sender.sentRequests.filter(
      (request) => request._id.toString() !== receiverUserId
    );

    receiver.friends.push(senderUserId);
    sender.friends.push(receiverUserId);

    await receiver.save();
    await sender.save();

    res.status(200).json({ message: "Friend added successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding friend!", error: error.message });
  }
};

const removeFriend = async (req, res) => {
  try {
    const { senderUserId, receiverUserId } = req.body;

    if (
      req.user._id.toString() !== senderUserId &&
      req.user._id.toString() !== receiverUserId
    )
      return res.status(403).json({ message: "Unauthorized!" });

    const receiver = await fetchUserById(receiverUserId);
    const sender = await fetchUserById(senderUserId);

    if (!sender) return res.status(404).json({ message: "Sender not found!" });

    if (!receiver)
      return res.status(404).json({ message: "Receiver not found!" });

    if (
      !receiver.friends.some((friend) => friend._id.toString() === senderUserId)
    )
      return res.status(400).json({ message: "Users already not friends!" });

    receiver.friends = receiver.friends.filter(
      (friend) => friend._id.toString() !== senderUserId
    );
    sender.friends = sender.friends.filter(
      (friend) => friend._id.toString() !== receiverUserId
    );

    await receiver.save();
    await sender.save();

    res.status(200).json({ message: "Friend removed successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error removing friend!", error: error.message });
  }
};

module.exports = { fetchFriendsOverview, addFriend, removeFriend };
