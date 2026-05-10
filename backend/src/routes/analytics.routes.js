import { Router } from "express";
import * as controller from "../controllers/analytics.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireCollegeAdmin } from "../middleware/collegePermission.middleware.js";

const router = Router();

router.use(authenticate, requireCollegeAdmin);
router.get("/college", controller.collegeAnalytics);

export default router;
