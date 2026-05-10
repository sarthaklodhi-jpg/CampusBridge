import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { ROLE_VALUES, ROLES } from "../constants/roles.js";

const socialLinksSchema = new mongoose.Schema(
  {
    linkedin: String,
    github: String,
    portfolio: String,
    twitter: String
  },
  { _id: false }
);

const refreshTokenSchema = new mongoose.Schema(
  {
    tokenId: { type: String, required: true },
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 32,
      index: true
    },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ROLE_VALUES, default: ROLES.STUDENT, index: true },
    college: { type: mongoose.Schema.Types.ObjectId, ref: "College", index: true },
    branch: { type: String, trim: true, maxlength: 80 },
    year: { type: Number, min: 1, max: 8 },
    bio: { type: String, trim: true, maxlength: 300 },
    skills: [{ type: String, trim: true, lowercase: true, maxlength: 40 }],
    profilePicture: String,
    coverImage: String,
    socialLinks: socialLinksSchema,
    connections: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    savedResources: [{ type: mongoose.Schema.Types.ObjectId, ref: "Resource" }],
    savedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
    refreshTokens: [refreshTokenSchema],
    isActive: { type: Boolean, default: true },
    lastSeenAt: Date
  },
  { timestamps: true }
);

userSchema.index({ name: "text", username: "text", skills: "text", branch: "text" });
userSchema.index({ college: 1, role: 1 });

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toJSON = function toJSON() {
  const user = this.toObject();
  delete user.password;
  delete user.refreshTokens;
  return user;
};

export default mongoose.model("User", userSchema);
