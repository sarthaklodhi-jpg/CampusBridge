import mongoose from "mongoose";

const connectionRequestSchema = new mongoose.Schema(
  {
    requester: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending", index: true }
  },
  { timestamps: true }
);

connectionRequestSchema.index({ requester: 1, recipient: 1 }, { unique: true });

export default mongoose.model("ConnectionRequest", connectionRequestSchema);
