import express from "express";
import {
  generateJobDescription,
  getAISuggestions,
  parseResume,
  compareResumeWithJD,
  uploadMiddleware
} from "../controllers/aiSuggestionController.js";

const router = express.Router();

// Generate job description based on sector, country, and designation
router.post("/generate-job-description", generateJobDescription);

// Upload resume and get AI suggestions (includes job description generation and comparison)
router.post("/ai-suggestions", uploadMiddleware, getAISuggestions);

// Parse resume only (without AI suggestions)
router.post("/parse-resume", uploadMiddleware, parseResume);

// Compare resume with custom job description
router.post("/compare-resume", compareResumeWithJD);

export default router;
