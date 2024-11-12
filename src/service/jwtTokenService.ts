import jwt from 'jsonwebtoken'

export async function generateAccessToken(email: string): Promise<string> {
    return jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: "10h" })
}
