import { ApiError } from "../utils/apiError.js";

export const validate = (schema, property = "body") => (req, _res, next) => {
  const { error, value } = schema.validate(req[property], {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const details = error.details.map((item) => ({
      path: item.path.join("."),
      message: item.message
    }));
    return next(new ApiError(422, "Invalid request data", details));
  }

  req[property] = value;
  next();
};
