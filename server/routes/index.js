import userRoute from './userRoutes.js'


import express from 'express'
const router = express.Router()

router.use("/user", userRoute)

export default router