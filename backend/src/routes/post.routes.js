import { Router } from "express";
import * as controller from "../controllers/post.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createPostSchema, updatePostSchema } from "../validators/post.validators.js";

const router = Router();

router.get("/public", controller.publicFeed);
router.get("/trending", controller.trending);
router.use(authenticate);
router.get("/college", controller.collegeFeed);
router.get("/saved", controller.savedPosts);
router.post("/", validate(createPostSchema), controller.createPost);
router.patch("/:id", validate(updatePostSchema), controller.updatePost);
router.delete("/:id", controller.deletePost);
router.post("/:id/like", controller.toggleLike);
router.post("/:id/save", controller.toggleSave);

export default router;
