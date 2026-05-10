import { Router } from "express";
import * as controller from "../controllers/resource.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireCollege } from "../middleware/collegePermission.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { resourceSchema } from "../validators/resource.validators.js";

const router = Router();

router.use(authenticate, requireCollege);
router.get("/", controller.listResources);
router.post("/", validate(resourceSchema), controller.createResource);
router.post("/:id/save", controller.toggleSave);
router.delete("/:id", controller.deleteResource);

export default router;
