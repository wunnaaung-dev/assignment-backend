import { Request, Response, NextFunction } from "express";
import { User } from "../models/user";
import { generateToken, sendVerificationEmail } from "../service/emailVerificationService";
import { getUserWithEmail, updateUserEmailVerification } from "../service/userService";
import { BadRequestError } from "../common/errors/bad-request-error";
import { NotFoundError } from "../common/errors/not-found-error";
import { UnauthorizedError } from "../common/errors/unauthorized-error";
import { EmailVerificationRequest, RegisterRequest, VerifyOTPRequest } from "../types/requests";
import { generateRandomBase32, createTOTP } from "../service/otpService";

const verificationTokens = new Map()

const GenerateOTP = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { user_id } = req.body;

        const user = await User.findById(user_id);
        if (!user) {
            next(new BadRequestError("User Not found"))
        }

        const base32_secret = generateRandomBase32();
        const totp = createTOTP(base32_secret);

        const updatedUser = await User.findByIdAndUpdate(
            user_id,
            { 
                otp_auth_url: totp.toString(), 
                otp_auth_secret: base32_secret.toUpperCase()
            },
            { new: true }
        );

        if (!updatedUser) {
            next(new Error("Failed to update OTP"))
        }

        res.status(200).json({
            status: "success",
            base32_secret: base32_secret.toUpperCase(),
            otp_auth_url: totp.toString(),
        });
    } catch (error) {
        next(error);
    }
};

const VerifyOTP = async (
    req: Request<{}, {}, VerifyOTPRequest>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { user_id, token } = req.body;

        if (!user_id || !token || !/^\d{6}$/.test(token)) {
            next(new BadRequestError("Invalid input: user_id and a 6-digit token are required"))
        }

        const user = await User.findById(user_id);
        if (!user) {
            next(new NotFoundError("User not found"))
        }

        if (!user!.otp_auth_secret) {
            next(new BadRequestError("2FA is not set up for this user"))
        }

        const totp = createTOTP(user!.otp_auth_secret!);
        
        const isValid = totp.validate({ 
            token, 
            window: 1   
        }) !== null;

        if (!isValid) {
            next(new UnauthorizedError("Invalid or expired token"))
        }
        res.status(200).json({
            status: "success",
            otp_valid: true,
            message: "OTP verification successful"
        });
    } catch (error) {
        next(error);
    }
};

const RegisterUser = async(req: Request<{}, {}, RegisterRequest>, res: Response, next: NextFunction) => {
    try {
        const {username, email, password} = req.body
        const newUser = User.build({
            username: username,
            email: email,
            password: password,
            isEmailVerified: false
        })
        await newUser.save()
        const verificationToken = generateToken()
        verificationTokens.set(verificationToken, {
            email,
            expires: Date.now() + 24 * 60 * 60 * 1000
        })
        await sendVerificationEmail(email, verificationToken)
        res.status(200).json({
            user: newUser
        })
    } catch (error) {
        next(error)
    }
}

const LoginUser = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {email, password} = req.body
        const isUserExist = await getUserWithEmail(email)
    
        res.status(200).json({
          user_id: isUserExist!._id
        })
    } catch (error) {
        next(error)
    }
}

const VerifyEmail = async(req: Request<{}, {}, {}, EmailVerificationRequest>, res: Response, next: NextFunction) => {
    const {email, token} = req.query
    const verification = verificationTokens.get(token)
    try {
        if(!verification || verification.email !== email) {
            return next(new BadRequestError("Invalid or expired verification token"))
        }

        if(Date.now() > verification.expires) {
            verificationTokens.delete(token)
            return next(new BadRequestError("Verification token has expired"))
        }

        await updateUserEmailVerification(email)
        verificationTokens.delete(token)
        res.status(200).json({
            message: 'Email verified successfully. You can in to your account now'
        })
    } catch (error) {
        next(error)   
    }
}

export default { GenerateOTP, VerifyOTP, RegisterUser, LoginUser, VerifyEmail };