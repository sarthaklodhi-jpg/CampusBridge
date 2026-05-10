import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: {
      type: String,
      enum: ["like", "comment", "reply", "connection_request", "connection_accept", "announcement"],
      required: true,
      index: true
    },
    entityType: { type: String, enum: ["Post", "Comment", "Connection", "College"] },
    entity: { type: mongoose.Schema.Types.ObjectId, refPath: "entityType" },
    message: { type: String, required: true, maxlength: 180 },
    readAt: Date
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, readAt: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);
