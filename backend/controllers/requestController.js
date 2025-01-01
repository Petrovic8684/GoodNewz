const { fetchUserById } = require("../utilities/fetchUtility");

const sendRequest = async (req, res) => {
  try {
    const { senderUserId, receiverUserId } = req.body;

    if (req.user._id.toString() !== senderUserId)
      return res.status(403).json({ message: "Unauthorized!" });

    const sender = await fetchUserById(senderUserId);
    const receiver = await fetchUserById(receiverUserId);

    if (!sender) return res.status(404).json({ message: "Sender not found!" });

    if (!receiver)
      return res.status(404).json({ message: "Receiver not found!" });

    if (
      sender.friends.some((friend) => friend._id.toString() === receiverUserId)
    )
      return res.status(400).json({ message: "Users already friends!" });

    if (
      sender.sentRequests.some(
        (request) => request._id.toString() === receiverUserId
      )
    )
      return res.status(400).json({ message: "Request already sent!" });

    receiver.pendingRequests.push(senderUserId);
    sender.sentRequests.push(receiverUserId);

    await receiver.save();
    await sender.save();

    res.status(200).json({ message: "Request sent!" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error sending request!", error: error.message });
  }
};

const cancelRequest = async (req, res) => {
  try {
    const { senderUserId, receiverUserId } = req.body;

    if (req.user._id.toString() !== senderUserId)
      return res.status(403).json({ message: "Unauthorized!" });

    const sender = await fetchUserById(senderUserId);
    const receiver = await fetchUserById(receiverUserId);

    if (!sender) return res.status(404).json({ message: "Sender not found!" });

    if (!receiver)
      return res.status(404).json({ message: "Receiver not found!" });

    const isRequestSent = sender.sentRequests.some(
      (request) => request._id.toString() === receiverUserId
    );

    const isPendingRequest = receiver.pendingRequests.some(
      (request) => request._id.toString() === senderUserId
    );

    if (!isRequestSent || !isPendingRequest) {
      return res
        .status(400)
        .json({ message: "Request already canceled or not found!" });
    }

    receiver.pendingRequests = receiver.pendingRequests.filter(
      (request) => request._id.toString() !== senderUserId
    );
    sender.sentRequests = sender.sentRequests.filter(
      (request) => request._id.toString() !== receiverUserId
    );

    await receiver.save();
    await sender.save();

    res.status(200).json({ message: "Request successfully canceled!" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error canceling request!", error: error.message });
  }
};

module.exports = { sendRequest, cancelRequest };
