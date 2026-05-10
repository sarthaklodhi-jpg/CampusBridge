import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, trim: true, maxlength: 1200 },
    type: { type: String, enum: ["hackathon", "workshop", "seminar", "contest", "meetup", "other"], default: "other", index: true },
    bannerImage: String,
    startsAt: { type: Date, required: true, index: true },
    location: { type: String, required: true, trim: true, maxlength: 160 },
    organizer: { type: String, trim: true, maxlength: 120 },
    college: { type: mongoose.Schema.Types.ObjectId, ref: "College", required: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rsvps: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
  },
  { timestamps: true }
);

eventSchema.index({ title: "text", description: "text", location: "text", organizer: "text" });
eventSchema.index({ college: 1, startsAt: 1 });

export default mongoose.model("Event", eventSchema);
