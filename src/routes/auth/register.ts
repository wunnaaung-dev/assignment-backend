import { NextFunction, Request, Response, Router } from "express";
import { User } from "../../models/user";
import { BadRequestError } from "../../common/errors/bad-request-error";
import { generateToken, sendVerificationEmail } from "../../service/emailVerificationService";
import { generateAccessToken } from "../../service/jwtTokenService";
import jwt from 'jsonwebtoken'

const router = Router()
const verificationTokens = new Map()

router.post("/api/auth/register", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username, email, password } = req.body
        console.log(username, email, password)

        const isExistingUser = await User.findOne({ email })
        if (isExistingUser) {
            return next(new BadRequestError("User already exists"))
        }

        const newUser = User.build({
            username: username,
            email: email,
            password: password,
            isEmailVerified: false
        })
        await newUser.save();
        const accessToken = await generateAccessToken(email);
        const verificationToken = generateToken()
        verificationTokens.set(verificationToken, {
            email,
            expires: Date.now() + 24 * 60 * 60 * 1000
        })
        await sendVerificationEmail(email, verificationToken)
        res.status(200).json({
            message: 'Verification email sent. Please check your inbox.',
            accessToken: accessToken
        });
    } catch (error) {
        next(error)
    }
})

router.get("/api/auth/verify", async (req: Request, res: Response, next: NextFunction) => {
    const { email, token } = req.query as { email: string; token: string };
    const verification = verificationTokens.get(token);

    try {
        if (!verification || verification.email !== email) {
            return next(new BadRequestError("Invalid or expired verification token"));
        }

        if (Date.now() > verification.expires) {
            verificationTokens.delete(token);
            return next(new BadRequestError("Verification token has expired"));
        }

        const user = await User.findOneAndUpdate(
            { email },
            { isEmailVerified: true },
            { new: true }
        );

        if (!user) {
            return next(new BadRequestError("User not found"));
        }

        verificationTokens.delete(token);

        res.status(200).json({
            message: 'Email verified successfully. You can sign in to your account now'
        });
    } catch (error) {
        next(error);
    }
});
export { router as registerRouter }