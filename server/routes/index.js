import userRoute from './userRoutes.js'
import aiSuggestionRoute from './aiSuggestionRoutes.js'
// import resumeModel from '../models/resumeModel.js' 
import resumeRoute from './resumeRoutes.js'; // ✅ Make sure the filename is correct
import express from 'express'
const router = express.Router()

router.use("/user", userRoute)
router.use("/ai", aiSuggestionRoute)
// router.use("/resume", resumeModel)
router.use("/resume", resumeRoute)
export default router