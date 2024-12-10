import { NextFunction, Request, Response } from "express";
import { getUserWithEmail } from "../service/userService";
import { BadRequestError } from "../common/errors/bad-request-error";
import { verifyPassword } from "../service/passwordHashingService";

export const isValidUser = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body

    const isUserExist = await getUserWithEmail(email)
    if (isUserExist === null) {
        next(new BadRequestError("User Not Found! Email does not exist"))
    }

    if (!isUserExist?.isEmailVerified) {
        next(new BadRequestError("Please verify your email first"))
    }
    
    const isEqual = await verifyPassword(isUserExist!.password, password)
    if (!isEqual) {
        next(new BadRequestError("Wrong Password"))
    }

    next()
}

export const isExistingUser = async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body
    const isUserExist = await getUserWithEmail(email)
    if (isUserExist) {
        next(new BadRequestError("User already exist!"))
    }

    next()
}