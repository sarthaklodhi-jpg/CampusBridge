import { Router } from "express";
import * as controller from "../controllers/report.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireCollege, requireCollegeAdmin } from "../middleware/collegePermission.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createReportSchema, updateReportSchema } from "../validators/report.validators.js";

const router = Router();

router.use(authenticate, requireCollege);
router.post("/", validate(createReportSchema), controller.createReport);
router.get("/", requireCollegeAdmin, controller.listReports);
router.patch("/:id", requireCollegeAdmin, validate(updateReportSchema), controller.updateReport);

export default router;
