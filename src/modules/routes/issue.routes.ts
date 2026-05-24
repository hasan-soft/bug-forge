import express, { type Router } from "express";
import { issueController } from "../controllers/issue.controller.js";
import { authenticate, authorizeRole } from "../../middleware/auth.js";

const router: Router = express.Router();

router.get("/", issueController.getAllIssues);
router.get("/:id", issueController.getSingleIssue);

router.post("/", authenticate, issueController.createIssue);

router.patch("/:id", authenticate, issueController.updateIssue);

router.delete(
  "/:id",
  authenticate,
  authorizeRole("maintainer"),
  issueController.deleteIssue,
);

export default router;
