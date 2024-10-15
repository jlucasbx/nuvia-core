import mongoose, { Types, Schema } from "mongoose"
import { IFile } from "@types"

export const fileSchema = new Schema<IFile>({
    userId: Types.ObjectId,
    name: { type: String, required: true },
    mimeType: { type: String, required: true },
    isFavorite: { type: Boolean, default: false },
    size: { type: Number, required: true },
    url: { type: String, required: true },
    previewUrl: { type: String, required: true }
}, {
    timestamps: true
})

export const File = mongoose.model<IFile>("File", fileSchema)
