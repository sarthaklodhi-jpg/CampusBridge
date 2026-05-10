import { Router } from "express";
import * as controller from "../controllers/college.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireCollege, requireCollegeAdmin, requireCollegeOwner } from "../middleware/collegePermission.middleware.js";
import { imageUpload } from "../middleware/upload.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createCollegeSchema, inviteSchema, joinCollegeSchema, roleSchema, updateCollegeSchema } from "../validators/college.validators.js";

const router = Router();

router.get("/", controller.listColleges);
router.get("/me/current", authenticate, controller.myCollege);
router.use(authenticate);
router.post("/", validate(createCollegeSchema), controller.createCollege);
router.post("/join", validate(joinCollegeSchema), controller.joinCollege);
router.delete("/leave", requireCollege, controller.leaveCollege);
router.get("/members/list", requireCollegeAdmin, controller.listMembers);
router.post("/invites", requireCollegeAdmin, validate(inviteSchema), controller.createInvite);
router.get("/invites", requireCollegeAdmin, controller.listInvites);
router.patch("/invites/:inviteId/revoke", requireCollegeAdmin, controller.revokeInvite);
router.patch("/update", requireCollegeOwner, validate(updateCollegeSchema), controller.updateCollege);
router.patch("/logo", requireCollegeOwner, imageUpload.single("image"), controller.uploadLogo);
router.patch("/banner", requireCollegeOwner, imageUpload.single("image"), controller.uploadBanner);
router.delete("/members/:memberId", requireCollegeOwner, controller.removeMember);
router.patch("/members/:memberId/transfer-owner", requireCollegeOwner, controller.transferOwnership);
router.patch("/:collegeId/members/:memberId/role", requireCollegeOwner, validate(roleSchema), controller.updateMemberRole);
router.get("/:slug", controller.getCollege);

export default router;
