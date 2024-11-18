import { Model, model, Schema, Document } from "mongoose";
import { hashPassword } from "../service/passwordHashingService";

export interface UserDoc extends Document {
    username: string;
    email: string;
    password: string;
    isEmailVerified: boolean;
    otp_auth_url?: string;
    otp_auth_secret?: string;
}

export interface CreateUserDto {
    username: string;
    email: string;
    password: string;
    isEmailVerified: boolean;
    otp_auth_url?: string;
    otp_auth_secret?: string;
}

export interface UserModel extends Model<UserDoc> {
    build(dto: CreateUserDto): UserDoc;
}

const UserSchema: Schema = new Schema(
    {
        username: { type: String, required: true },
        email: { type: String, unique: true, required: true },
        password: { type: String, required: true },
        isEmailVerified: { type: Boolean, required: true },
        otp_auth_url: { type: String },
        otp_auth_secret: { type: String },
    },
    { timestamps: true }
);

UserSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        const hashedPassword = await hashPassword(this.get("password") as string);
        this.set("password", hashedPassword);
    }
    next();
});

UserSchema.statics.build = (dto: CreateUserDto) => {
    return new User(dto);
};

export const User = model<UserDoc, UserModel>("Users", UserSchema);
