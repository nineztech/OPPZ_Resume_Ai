import userRoute from './userRoutes.js'
import aiSuggestionRoute from './aiSuggestionRoutes.js'

import express from 'express'
const router = express.Router()

router.use("/user", userRoute)
router.use("/ai", aiSuggestionRoute)

export default router