import mongoose, { Schema } from "mongoose"
import { fileSchema } from "@models/file"
import { pluginSchema } from "@models/plugin"
import { IUser } from "@types"
import argon from "argon2"
import { Cloud, cloudSchema } from "./cloud"

const userSchema = new Schema<IUser>({
    email: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    picture: fileSchema,
    plugins: [pluginSchema],
    cloud: cloudSchema
}, {
    timestamps: true
})

userSchema.virtual("confirmPassword")

userSchema.pre("save", async function() {
    const hash = await argon.hash(this.password)
    this.password = hash
    this.cloud = new Cloud()
})

export const User = mongoose.model<IUser>("User", userSchema)
