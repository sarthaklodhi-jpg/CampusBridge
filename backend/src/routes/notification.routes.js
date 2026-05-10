import { Router } from "express";
import * as controller from "../controllers/notification.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);
router.get("/", controller.listNotifications);
router.patch("/read-all", controller.markAllRead);
router.patch("/:id/read", controller.markRead);

export default router;
