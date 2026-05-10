import cloudinary from "../config/cloudinary.js";
import { ApiError } from "./apiError.js";

export const uploadBufferToCloudinary = (file, folder) =>
  new Promise((resolve, reject) => {
    if (!file) return reject(new ApiError(400, "Image file is required"));

    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [{ quality: "auto", fetch_format: "auto" }]
      },
      (error, result) => {
        if (error) return reject(new ApiError(502, "Image upload failed", error.message));
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes
        });
      }
    );

    stream.end(file.buffer);
  });
