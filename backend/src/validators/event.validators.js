import Joi from "joi";

export const eventSchema = Joi.object({
  title: Joi.string().trim().min(3).max(160).required(),
  description: Joi.string().trim().max(1200).allow(""),
  type: Joi.string().valid("hackathon", "workshop", "seminar", "contest", "meetup", "other").default("other"),
  bannerImage: Joi.string().uri().allow(""),
  startsAt: Joi.date().iso().required(),
  location: Joi.string().trim().min(2).max(160).required(),
  organizer: Joi.string().trim().max(120).allow("")
});
