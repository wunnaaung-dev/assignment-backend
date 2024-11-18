import { Router } from "express";
import authController from "../../controllers/auth.controller";
const router = Router()


router.post('/otp/generate', authController.GenerateOTP)

router.post("/otp/verify", authController.VerifyOTP)


export default router