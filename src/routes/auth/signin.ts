import { NextFunction, Request, Response, Router } from "express";
import { User, UserDoc } from "../../models/user";
import { BadRequestError } from "../../common/errors/bad-request-error";
import { verifyPassword } from "../../service/passwordHashingService";
import { generateAccessToken } from "../../service/jwtTokenService";

const router = Router()

router.post("/api/auth/login", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {email, password} = req.body
        const isUserExist: UserDoc | null = await User.findOne({email})
        if(!isUserExist) {
            return next(new BadRequestError("User does not exist"))
        }
        if(isUserExist.isEmailVerified === false) {
            return next(new BadRequestError("Please verify your email first"))
        }
        const isEqual = await verifyPassword(isUserExist.password, password)
        if(!isEqual) return next(new BadRequestError("Wrong Password"))
        res.status(200).json({
           user: {
            userName: isUserExist.username,
            email: isUserExist.email
           }
        })

    } catch (error) {
        console.log(error)
    }
})

export {router as signInRouter}