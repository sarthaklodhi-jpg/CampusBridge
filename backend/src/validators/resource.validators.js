import Joi from "joi";

export const resourceSchema = Joi.object({
  title: Joi.string().trim().min(3).max(160).required(),
  description: Joi.string().trim().max(800).allow(""),
  category: Joi.string().trim().lowercase().min(2).max(60).required(),
  tags: Joi.array().items(Joi.string().trim().lowercase().max(40)).max(12).default([]),
  resourceUrl: Joi.string().uri().required(),
  resourceType: Joi.string().valid("pdf", "notes", "assignment", "drive", "link", "other").default("link")
});
