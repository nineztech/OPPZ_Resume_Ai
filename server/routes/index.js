import userRoute from './userRoutes.js'
import templateRoutes from './templateRoutes.js'

import express from 'express'
const router = express.Router()

router.use("/user", userRoute)
router.use("/", templateRoutes)

export default router