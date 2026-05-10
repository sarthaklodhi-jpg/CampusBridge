import mongoose from "mongoose";
import { POST_TYPES } from "../constants/postTypes.js";

const postSchema = new mongoose.Schema(
  {
    type: { type: String, enum: POST_TYPES, default: "discussion", index: true },
    content: { type: String, required: true, trim: true, maxlength: 4000 },
    images: [String],
    tags: [{ type: String, trim: true, lowercase: true, index: true }],
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    college: { type: mongoose.Schema.Types.ObjectId, ref: "College", index: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    commentsCount: { type: Number, default: 0 },
    isPublic: { type: Boolean, default: false, index: true },
    editedAt: Date
  },
  { timestamps: true }
);

postSchema.index({ content: "text", tags: "text" });
postSchema.index({ college: 1, createdAt: -1 });
postSchema.index({ isPublic: 1, createdAt: -1 });
postSchema.index({ likes: 1, commentsCount: 1, createdAt: -1 });

export default mongoose.model("Post", postSchema);
