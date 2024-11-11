import { Model, model, Schema, Document } from "mongoose";
import { hashPassword } from "../service/passwordHashingService";


export interface UserDoc extends Document {
    username: string;
    email: string;
    password: string;
    isEmailVerified: boolean
}

export interface CreateUserDto {
    username: string;
    email: string;
    password: string;
    isEmailVerified: boolean
}

export interface UserModel extends Model<UserDoc> {
    build(dto: CreateUserDto): UserDoc
}

const UserSchema: Schema = new Schema(
    {
        username: {
            type: String,
            required: true
        },
        email: {
            type: String,
            unique: true,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        isEmailVerified: {
            type: Boolean,
            required: true
        }
    },
    {timestamps: true}
)

UserSchema.pre("save", async function (next) {
    const password = this.get("password")
    if(this.isModified("password")) {
        const hashedPassword = await hashPassword(password as string)
        this.set("password", hashedPassword)
    }
    next()
})

UserSchema.statics.build = (dto: CreateUserDto) => {
    return new User(dto)
}

export const User = model<UserDoc, UserModel>("Users", UserSchema)