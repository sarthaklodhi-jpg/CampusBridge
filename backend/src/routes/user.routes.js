import { Router } from "express";
import * as controller from "../controllers/user.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { imageUpload } from "../middleware/upload.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { updateProfileSchema } from "../validators/user.validators.js";

const router = Router();

router.use(authenticate);
router.get("/search", controller.searchUsers);
router.get("/suggestions", controller.suggestions);
router.patch("/me", validate(updateProfileSchema), controller.updateProfile);
router.patch("/me/profile-picture", imageUpload.single("image"), controller.uploadProfilePicture);
router.patch("/me/cover-image", imageUpload.single("image"), controller.uploadCoverImage);
router.get("/:username", controller.getProfile);

export default router;
