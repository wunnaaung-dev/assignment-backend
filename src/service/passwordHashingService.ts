import * as argon2 from 'argon2'

export async function hashPassword(pwd: string): Promise<string> {
    return await argon2.hash(pwd)
}

export async function verifyPassword(hashedPwd: string, inputPwd: string): Promise<boolean> {
    try {
        const isMatch = await argon2.verify(hashedPwd, inputPwd)
        return isMatch ? true : false
    } catch (error) {
        return false
    }
}