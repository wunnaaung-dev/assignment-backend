
export interface VerifyOTPRequest {
    user_id: string;
    token: string;
}


export interface RegisterRequest {
    username: string
    email: string
    password: string
}

export interface EmailVerificationRequest {
    email: string
    token: string
}