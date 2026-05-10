import mongoose from "mongoose";

const collegeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    logo: String,
    bannerImage: String,
    description: { type: String, trim: true, maxlength: 500 },
    socialLinks: {
      website: String,
      linkedin: String,
      instagram: String
    },
    tags: [{ type: String, trim: true, lowercase: true, maxlength: 40 }],
    joinCode: { type: String, required: true, unique: true, uppercase: true, index: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    studentsCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

collegeSchema.index({ name: "text", description: "text" });

export default mongoose.model("College", collegeSchema);
