import Joi from "joi";

export const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80).required(),
  username: Joi.string().trim().lowercase().alphanum().min(3).max(32).required(),
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().min(8).max(72).required(),
  branch: Joi.string().trim().max(80).allow(""),
  year: Joi.number().integer().min(1).max(8),
  joinCode: Joi.string().trim().uppercase().allow("")
});

export const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().required()
});
