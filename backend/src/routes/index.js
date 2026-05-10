import { Router } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import collegeRoutes from "./college.routes.js";
import postRoutes from "./post.routes.js";
import commentRoutes from "./comment.routes.js";
import notificationRoutes from "./notification.routes.js";
import connectionRoutes from "./connection.routes.js";
import searchRoutes from "./search.routes.js";
import announcementRoutes from "./announcement.routes.js";
import resourceRoutes from "./resource.routes.js";
import eventRoutes from "./event.routes.js";
import reportRoutes from "./report.routes.js";
import analyticsRoutes from "./analytics.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/colleges", collegeRoutes);
router.use("/posts", postRoutes);
router.use("/comments", commentRoutes);
router.use("/notifications", notificationRoutes);
router.use("/connections", connectionRoutes);
router.use("/search", searchRoutes);
router.use("/announcements", announcementRoutes);
router.use("/resources", resourceRoutes);
router.use("/events", eventRoutes);
router.use("/reports", reportRoutes);
router.use("/analytics", analyticsRoutes);

export default router;
