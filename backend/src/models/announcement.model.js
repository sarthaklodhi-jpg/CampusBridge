import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    content: { type: String, required: true, trim: true, maxlength: 4000 },
    priority: { type: String, enum: ["normal", "important", "urgent"], default: "normal", index: true },
    pinned: { type: Boolean, default: false, index: true },
    attachments: [String],
    college: { type: mongoose.Schema.Types.ObjectId, ref: "College", required: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reactions: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
  },
  { timestamps: true }
);

announcementSchema.index({ title: "text", content: "text" });
announcementSchema.index({ college: 1, pinned: -1, createdAt: -1 });

export default mongoose.model("Announcement", announcementSchema);
