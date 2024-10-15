import mongoose, { Schema } from "mongoose"
import { fileSchema } from "@models/file"
import { ICloud } from "@types"

export const cloudSchema = new Schema<ICloud>({
    totalSize: { type: Number, default: 12 },
    usedSize: { type: Number, default: 0 },
    files: [fileSchema]
}, {
    timestamps: true
})

export const Cloud = mongoose.model<ICloud>("Cloud", cloudSchema)
