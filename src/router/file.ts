import { FILE } from "@decorators/file"
import { AUTH, DELETE, GET, POST } from "@decorators/http-handler"
import { ValidationError } from "@errors/validation-error"
import { File } from "@models/file"
import { throwIfIsNotValid } from "@utils/throw-if-is-not-valid"
import { IQuery } from "@types"
import { queryValidator } from "@validators/query-validator"
import path from "path"
import { unlink } from "fs/promises"
import { User } from "@models/user"

const dirname = "/home/jlucasbx/code/faculdade/nuvia-core"
export const getFile = GET("/:url", async ({ res, req }) => {
    const url = req.params["url"]
    const filePath = path.join(dirname, "uploads", url)
    res.sendFile(filePath)
})

export const auth = AUTH()

export const uploadFile = FILE("file", POST(async ({ res, req: { file }, user, next }) => {

    if (!file) return next(new ValidationError(
        "The multipart/form is not valid",
        [{ field: "file", message: "The file field in empty" }]
    ))

    await User.findByIdAndUpdate(user._id, {
        $set: { "cloud.usedSize": user.cloud.usedSize + file.size }
    })
    const doc = new File({
        name: file.originalname.split(".")[0],
        mimeType: file.mimetype,
        size: file.size,
        url: file.filename,
        previewUrl: file.filename,
        userId: user._id
    })

    await doc.save()

    res.json({
        status: "success",
        message: "The file is uploaded succesfully",
        data: [doc]
    })
}))


export const deleteFile = DELETE("/:id", async ({ res, req, user }) => {

    const id = req.params["id"]
    const file = await File.findByIdAndDelete(id).lean()
    if(!file) return
    const filePath = path.join(dirname, "uploads", file?.previewUrl as string)
    await unlink(filePath)
    const newSize = user.cloud.usedSize - file.size
    await User.findByIdAndUpdate(user._id, {
        $set: { "cloud.usedSize": newSize < 0 ? 0 : newSize}
    })
    res.json({
        status: "success",
        message: "The file was deleted succesfully",
        data: []
    })
})

export const updateFile = POST<{ name: string }>("/:id", async ({ res, req }, updateFile) => {

    const id = req.params["id"]
    const file = await File.findByIdAndUpdate(id, {
        name: updateFile.name
    }).lean()
    res.json({
        status: "success",
        message: "The file was updated succesfully",
        data: [file]
    })
})


export const listingFiles = GET<IQuery>(async ({ req, res, user }) => {
    const page = parseInt(req.params["page"])

    const query = {
        keyword: req.params["keyword"] ?? "",
        order: req.params["order"] ?? "asc",
        page: isNaN(page) ? 1 : page
    }

    await throwIfIsNotValid({
        schema: queryValidator,
        message: "The query is invalid",
        data: query
    })

    const files = await File
        .find({
            name: new RegExp(query.keyword, "i"),
            userId: user._id
        })
        .sort({ createdAt: query.order === "asc" ? 1 : -1 })
        .limit(10)
        .skip(query.page)

    res.json({
        status: "success",
        message: "The query was executed succesfully",
        data: files
    })
})
