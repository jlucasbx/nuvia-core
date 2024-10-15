import mongoose, { Schema, Types } from "mongoose"
import { IPlugin } from "@types"

export const pluginSchema = new Schema<IPlugin>({
    userId: Types.ObjectId,
    name: { type: String, required: true },
    url: { type: String, required: true },
    types: [String]
}, {
    timestamps: true
})

export const Plugin = mongoose.model<IPlugin>("Plugin", pluginSchema)
