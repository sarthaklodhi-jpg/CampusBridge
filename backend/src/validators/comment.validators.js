import Joi from "joi";

export const createCommentSchema = Joi.object({
  postId: Joi.string().hex().length(24).required(),
  content: Joi.string().trim().min(1).max(1200).required(),
  parent: Joi.string().hex().length(24).allow(null)
});
