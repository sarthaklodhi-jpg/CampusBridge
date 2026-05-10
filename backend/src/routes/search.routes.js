import { Router } from "express";
import * as controller from "../controllers/search.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", authenticate, controller.globalSearch);

export default router;
