import Joi from "joi";

export const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80),
  branch: Joi.string().trim().max(80).allow(""),
  year: Joi.number().integer().min(1).max(8),
  bio: Joi.string().trim().max(300).allow(""),
  skills: Joi.array().items(Joi.string().trim().max(40)).max(20),
  profilePicture: Joi.string().uri().allow(""),
  coverImage: Joi.string().uri().allow(""),
  socialLinks: Joi.object({
    linkedin: Joi.string().uri().allow(""),
    github: Joi.string().uri().allow(""),
    portfolio: Joi.string().uri().allow(""),
    twitter: Joi.string().uri().allow("")
  })
});
