import { User, UserDoc } from "../models/user";

export async function getUserWithEmail(email: string): Promise<UserDoc | null> {
    const isExistingUser = await User.findOne({email})
    return isExistingUser
}