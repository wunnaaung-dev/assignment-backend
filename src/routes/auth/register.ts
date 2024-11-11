import { NextFunction, Request, Response, Router } from "express";
import { User } from "../../models/user";
import { BadRequestError } from "../../common/errors/bad-request-error";

const router = Router()


router.post("/api/auth/register", async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {username, email, password} = req.body

        const isExistingUser = await User.findOne({email})
        if(isExistingUser) return next(new BadRequestError("User already exists"))
        
        const newUser = User.build({
            username: username,
            email: email,
            password: password,
            isEmailVerified: false
        })
        await newUser.save();
    } catch (error) {
        next(error)
    }
})

export {router as registerRouter}