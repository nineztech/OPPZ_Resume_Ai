import userRoute from './userRoutes.js'
import aiSuggestionRoute from './aiSuggestionRoutes.js'
import resumeModel from '../models/reumeModel.js' 
import express from 'express'
const router = express.Router()

router.use("/user", userRoute)
router.use("/ai", aiSuggestionRoute)
router.use("/resume", resumeModel)

export default router