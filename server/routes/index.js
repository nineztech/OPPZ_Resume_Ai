import userRoute from './userRoutes.js'
import aiSuggestionRoute from './aiSuggestionRoutes.js'
import resumeRoute from './resumeRoutes.js'; 
import express from 'express'
const router = express.Router()

router.use("/user", userRoute)
router.use("/ai", aiSuggestionRoute)
router.use("/resume", resumeRoute)

export default router