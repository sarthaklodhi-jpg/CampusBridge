import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, trim: true, maxlength: 800 },
    category: { type: String, required: true, trim: true, lowercase: true, index: true },
    tags: [{ type: String, trim: true, lowercase: true, maxlength: 40 }],
    resourceUrl: { type: String, required: true },
    resourceType: { type: String, enum: ["pdf", "notes", "assignment", "drive", "link", "other"], default: "link", index: true },
    college: { type: mongoose.Schema.Types.ObjectId, ref: "College", required: true, index: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
  },
  { timestamps: true }
);

resourceSchema.index({ title: "text", description: "text", tags: "text", category: "text" });
resourceSchema.index({ college: 1, category: 1, createdAt: -1 });

export default mongoose.model("Resource", resourceSchema);
