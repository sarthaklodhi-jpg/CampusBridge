import Joi from "joi";
import { POST_TYPES } from "../constants/postTypes.js";

export const createPostSchema = Joi.object({
  type: Joi.string().valid(...POST_TYPES).default("discussion"),
  content: Joi.string().trim().min(1).max(4000).required(),
  images: Joi.array().items(Joi.string().uri()).max(6).default([]),
  tags: Joi.array().items(Joi.string().trim().lowercase().max(32)).max(10).default([]),
  isPublic: Joi.boolean().default(false)
});

export const updatePostSchema = Joi.object({
  content: Joi.string().trim().min(1).max(4000),
  images: Joi.array().items(Joi.string().uri()).max(6),
  tags: Joi.array().items(Joi.string().trim().lowercase().max(32)).max(10),
  isPublic: Joi.boolean()
});
