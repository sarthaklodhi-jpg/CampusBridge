import { Router } from "express";
import * as controller from "../controllers/announcement.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireCollege, requireCollegeAdmin } from "../middleware/collegePermission.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createAnnouncementSchema, updateAnnouncementSchema } from "../validators/announcement.validators.js";

const router = Router();

router.use(authenticate, requireCollege);
router.get("/", controller.listAnnouncements);
router.post("/", requireCollegeAdmin, validate(createAnnouncementSchema), controller.createAnnouncement);
router.patch("/:id", requireCollegeAdmin, validate(updateAnnouncementSchema), controller.updateAnnouncement);
router.delete("/:id", requireCollegeAdmin, controller.deleteAnnouncement);
router.post("/:id/react", controller.react);

export default router;
