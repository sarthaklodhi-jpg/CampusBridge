import { Router } from "express";
import * as controller from "../controllers/connection.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);
router.get("/requests", controller.listRequests);
router.post("/:userId/request", controller.sendRequest);
router.post("/requests/:id/accept", controller.acceptRequest);
router.post("/requests/:id/reject", controller.rejectRequest);
router.delete("/:userId", controller.removeConnection);

export default router;
