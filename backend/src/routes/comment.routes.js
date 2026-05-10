import { Router } from "express";
import * as controller from "../controllers/comment.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createCommentSchema } from "../validators/comment.validators.js";

const router = Router();

router.use(authenticate);
router.get("/post/:postId", controller.listComments);
router.post("/", validate(createCommentSchema), controller.createComment);
router.post("/:id/like", controller.toggleLike);
router.delete("/:id", controller.deleteComment);

export default router;
