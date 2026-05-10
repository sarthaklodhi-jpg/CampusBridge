import Joi from "joi";

export const createCollegeSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  description: Joi.string().trim().max(500).allow(""),
  logo: Joi.string().uri().allow(""),
  bannerImage: Joi.string().uri().allow("")
});

export const joinCollegeSchema = Joi.object({
  joinCode: Joi.string().trim().uppercase(),
  inviteCode: Joi.string().trim()
}).or("joinCode", "inviteCode");

export const roleSchema = Joi.object({
  role: Joi.string().valid("student", "college_admin").required()
});

export const inviteSchema = Joi.object({
  expiresInHours: Joi.number().integer().min(1).max(24 * 30).default(168),
  maxUses: Joi.number().integer().min(1).max(1000)
});

export const updateCollegeSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120),
  description: Joi.string().trim().max(500).allow(""),
  logo: Joi.string().uri().allow(""),
  bannerImage: Joi.string().uri().allow(""),
  tags: Joi.array().items(Joi.string().trim().lowercase().max(40)).max(15),
  socialLinks: Joi.object({
    website: Joi.string().uri().allow(""),
    linkedin: Joi.string().uri().allow(""),
    instagram: Joi.string().uri().allow("")
  })
});
