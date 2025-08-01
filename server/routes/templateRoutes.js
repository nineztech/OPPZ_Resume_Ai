import express from "express";
const router = express.Router();
import {
    getAllTemplates,
    getTemplateById,
    getTemplatesByCategory,
    searchTemplates,
    downloadTemplate,
    getTemplatePreview,
    getPopularTemplates,
    getNewTemplates
} from "../controllers/templateController.js";
import auth from "../middleware/auth.js";

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Template routes are working!' });
});

// Get all templates
router.get('/templates', getAllTemplates);

// Get template by ID
router.get('/templates/:id', getTemplateById);

// Get templates by category
router.get('/templates/category/:category', getTemplatesByCategory);

// Search templates
router.get('/templates/search/:query', searchTemplates);

// Download template (requires auth)
router.get('/templates/:id/download', auth,downloadTemplate);

// Get template preview
router.get('/templates/:id/preview', getTemplatePreview);

// Get popular templates
router.get('/templates/popular', getPopularTemplates);

// Get new templates
router.get('/templates/new', getNewTemplates);

export default router;