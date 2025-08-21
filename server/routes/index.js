import userRoute from './userRoutes.js'
import aiSuggestionRoute from './aiSuggestionRoutes.js'
<<<<<<< Updated upstream

=======
// import resumeModel from '../models/resumeModel.js' 
import resumeRoute from './resumeRoutes.js'; // ✅ Make sure the filename is correct
>>>>>>> Stashed changes
import express from 'express'
const router = express.Router()

router.use("/user", userRoute)
router.use("/ai", aiSuggestionRoute)
<<<<<<< Updated upstream

=======
// router.use("/resume", resumeModel)
router.use("/resume", resumeRoute)
>>>>>>> Stashed changes
export default router