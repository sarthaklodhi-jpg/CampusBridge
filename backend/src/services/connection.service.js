import ConnectionRequest from "../models/connectionRequest.model.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { createNotification } from "./notification.service.js";

export const sendConnectionRequest = async (recipientId, user) => {
  if (String(recipientId) === String(user._id)) throw new ApiError(400, "You cannot connect with yourself");
  const recipient = await User.findById(recipientId);
  if (!recipient) throw new ApiError(404, "User not found");
  if (String(recipient.college) !== String(user.college)) {
    throw new ApiError(403, "Connections are currently limited to your college");
  }

  const request = await ConnectionRequest.findOneAndUpdate(
    { requester: user._id, recipient: recipientId },
    { status: "pending" },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await createNotification({
    recipient: recipientId,
    actor: user._id,
    type: "connection_request",
    entityType: "Connection",
    entity: request._id,
    message: `${user.name} wants to connect`
  });

  return request;
};

export const respondToConnectionRequest = async (requestId, status, user) => {
  const request = await ConnectionRequest.findOne({ _id: requestId, recipient: user._id, status: "pending" });
  if (!request) throw new ApiError(404, "Connection request not found");
  request.status = status;
  await request.save();

  if (status === "accepted") {
    await Promise.all([
      User.findByIdAndUpdate(request.requester, { $addToSet: { connections: request.recipient } }),
      User.findByIdAndUpdate(request.recipient, { $addToSet: { connections: request.requester } }),
      createNotification({
        recipient: request.requester,
        actor: user._id,
        type: "connection_accept",
        entityType: "Connection",
        entity: request._id,
        message: `${user.name} accepted your connection request`
      })
    ]);
  }

  return request;
};

export const removeConnection = async (connectionId, user) => {
  await Promise.all([
    User.findByIdAndUpdate(user._id, { $pull: { connections: connectionId } }),
    User.findByIdAndUpdate(connectionId, { $pull: { connections: user._id } })
  ]);
};

export const listRequests = (user) =>
  ConnectionRequest.find({ recipient: user._id, status: "pending" }).populate("requester", "name username profilePicture bio");
