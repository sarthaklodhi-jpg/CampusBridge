import multer from "multer";
import { ApiError } from "../utils/apiError.js";

const allowedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const maxImageSize = 5 * 1024 * 1024;

const imageStorage = multer.memoryStorage();

export const imageUpload = multer({
  storage: imageStorage,
  limits: { fileSize: maxImageSize, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!allowedImageTypes.includes(file.mimetype)) {
      return cb(new ApiError(415, "Only JPG, PNG, WEBP, or GIF images are allowed"));
    }
    cb(null, true);
  }
});
