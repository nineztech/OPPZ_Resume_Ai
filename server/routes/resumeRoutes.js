import express from "express";
import {
  saveResume,
  updateResume,
  updateResumeTitle,
  getUserResumes,
  getResumeById,
  deleteResume,
  generatePDF,
  generateWord
} from "../controllers/resumeController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", saveResume);
router.put("/:id", updateResume);
router.patch("/:id/title", updateResumeTitle);
router.get("/", getUserResumes);
router.get("/:id", getResumeById);
router.delete("/:id", deleteResume);
router.post("/generate-pdf", generatePDF);
router.post("/generate-word", generateWord);

export default router;
