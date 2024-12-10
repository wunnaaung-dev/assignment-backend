import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import * as OTPAuth from "otpauth";
import { encode } from "hi-base32";
import { User } from "../models/user";
import { generateToken, sendVerificationEmail } from "../service/emailVerificationService";
import { getUserWithEmail } from "../service/userService";

const generateRandomBase32 = (): string => {
    const buffer = crypto.randomBytes(15);
    return encode(buffer).replace(/=/g, "").substring(0, 24);
};

const createTOTP = (secret: string): OTPAuth.TOTP => {
    return new OTPAuth.TOTP({
        issuer: "brilliantportal.com",
        label: "Brilliant Portal",
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: secret.toUpperCase(),
    });
};

const GenerateOTP = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { user_id } = req.body;

        const user = await User.findById(user_id);
        if (!user) {
            res.status(404).json({ status: "fail", message: "User not found" });
            return;
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
            res.status(500).json({ status: "fail", message: "Failed to update OTP" });
            return;
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

interface VerifyOTPRequest {
    user_id: string;
    token: string;
}

const VerifyOTP = async (
    req: Request<{}, {}, VerifyOTPRequest>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { user_id, token } = req.body;

        if (!user_id || !token || !/^\d{6}$/.test(token)) {
            res.status(400).json({
                status: "fail",
                message: "Invalid input: user_id and a 6-digit token are required"
            });
            return;
        }

        const user = await User.findById(user_id);
        if (!user) {
            res.status(404).json({ status: "fail", message: "User not found" });
            return;
        }

        if (!user.otp_auth_secret) {
            res.status(400).json({
                status: "fail",
                message: "2FA is not set up for this user"
            });
            return;
        }

        const totp = createTOTP(user.otp_auth_secret);
        

        const isValid = totp.validate({ 
            token, 
            window: 1   
        }) !== null;

        if (!isValid) {
            res.status(401).json({
                status: "fail",
                message: "Invalid or expired token"
            });
            return;
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

interface RegisterRequest {
    username: string
    email: string
    password: string
}

const verificationTokens = new Map()

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
        
    }
}

export default { GenerateOTP, VerifyOTP, RegisterUser, LoginUser };