import { Router } from "express";
import authController from "../../controllers/auth.controller";
import { isExistingUser, isValidUser } from "../../middlewares/check-user";
const router = Router()


router.post('/otp/generate', authController.GenerateOTP)

router.post("/otp/verify", authController.VerifyOTP)

router.post("/register", isExistingUser, authController.RegisterUser)

router.post("/login", isValidUser, authController.LoginUser)


export default router