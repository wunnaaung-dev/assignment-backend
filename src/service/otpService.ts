import crypto from "crypto";
import * as OTPAuth from "otpauth";
import { encode } from "hi-base32";

export const generateRandomBase32 = (): string => {
    const buffer = crypto.randomBytes(15);
    return encode(buffer).replace(/=/g, "").substring(0, 24);
};

export const createTOTP = (secret: string): OTPAuth.TOTP => {
    return new OTPAuth.TOTP({
        issuer: "brilliantportal.com",
        label: "Brilliant Portal",
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: secret.toUpperCase(),
    });
};