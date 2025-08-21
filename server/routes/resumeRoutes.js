import express from "express";
import {
  saveResume,
  updateResume,
  getUserResumes,
  getResumeById,
  deleteResume
} from "../controllers/resumeController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", saveResume);
router.put("/:id", updateResume);
router.get("/", getUserResumes);
router.get("/:id", getResumeById);
router.delete("/:id", deleteResume);

export default router;
