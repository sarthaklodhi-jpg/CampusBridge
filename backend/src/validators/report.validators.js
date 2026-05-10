import Joi from "joi";

export const createReportSchema = Joi.object({
  targetType: Joi.string().valid("Post", "Comment", "User").required(),
  target: Joi.string().hex().length(24).required(),
  reason: Joi.string().trim().min(3).max(80).required(),
  details: Joi.string().trim().max(600).allow("")
});

export const updateReportSchema = Joi.object({
  status: Joi.string().valid("open", "reviewing", "resolved", "dismissed").required(),
  resolutionNote: Joi.string().trim().max(400).allow("")
});
