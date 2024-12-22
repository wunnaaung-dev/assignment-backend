import jwt from 'jsonwebtoken';

export async function generateAccessToken(email: string, id: string, username: string): Promise<string> {
    return jwt.sign(
        { 
            email: email, 
            id: id, 
            username: username 
        },
        process.env.ACCESS_TOKEN_SECRET!, 
        { expiresIn: "10h" }
    );
}
