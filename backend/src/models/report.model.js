import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    targetType: { type: String, enum: ["Post", "Comment", "User"], required: true, index: true },
    target: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "targetType" },
    reason: { type: String, required: true, trim: true, maxlength: 80 },
    details: { type: String, trim: true, maxlength: 600 },
    status: { type: String, enum: ["open", "reviewing", "resolved", "dismissed"], default: "open", index: true },
    college: { type: mongoose.Schema.Types.ObjectId, ref: "College", required: true, index: true },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: Date,
    resolutionNote: { type: String, trim: true, maxlength: 400 }
  },
  { timestamps: true }
);

reportSchema.index({ college: 1, status: 1, createdAt: -1 });

export default mongoose.model("Report", reportSchema);
