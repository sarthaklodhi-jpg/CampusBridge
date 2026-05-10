import Joi from "joi";

export const createAnnouncementSchema = Joi.object({
  title: Joi.string().trim().min(3).max(160).required(),
  content: Joi.string().trim().min(1).max(4000).required(),
  priority: Joi.string().valid("normal", "important", "urgent").default("normal"),
  pinned: Joi.boolean().default(false),
  attachments: Joi.array().items(Joi.string().uri()).max(8).default([])
});

export const updateAnnouncementSchema = Joi.object({
  title: Joi.string().trim().min(3).max(160),
  content: Joi.string().trim().min(1).max(4000),
  priority: Joi.string().valid("normal", "important", "urgent"),
  pinned: Joi.boolean(),
  attachments: Joi.array().items(Joi.string().uri()).max(8)
});
