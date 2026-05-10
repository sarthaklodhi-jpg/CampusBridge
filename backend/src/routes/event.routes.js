import { Router } from "express";
import * as controller from "../controllers/event.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireCollege, requireCollegeAdmin } from "../middleware/collegePermission.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { eventSchema } from "../validators/event.validators.js";

const router = Router();

router.use(authenticate, requireCollege);
router.get("/", controller.listEvents);
router.post("/", requireCollegeAdmin, validate(eventSchema), controller.createEvent);
router.post("/:id/rsvp", controller.rsvp);
router.post("/:id/bookmark", controller.bookmark);

export default router;
