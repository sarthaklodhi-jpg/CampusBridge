import mongoose from "mongoose";

const collegeInviteSchema = new mongoose.Schema(
  {
    college: { type: mongoose.Schema.Types.ObjectId, ref: "College", required: true, index: true },
    code: { type: String, required: true, unique: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    expiresAt: Date,
    maxUses: { type: Number, min: 1 },
    uses: { type: Number, default: 0 },
    revokedAt: Date
  },
  { timestamps: true }
);

collegeInviteSchema.index({ college: 1, revokedAt: 1, expiresAt: 1 });

export default mongoose.model("CollegeInvite", collegeInviteSchema);
