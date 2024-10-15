import { AUTH, DELETE, GET, PATCH, POST } from "@decorators/http-handler"
import { ValidationError } from "@errors/validation-error"
import { Plugin } from "@models/plugin"
import { File } from "@models/file"
import { User } from "@models/user"
import { IPlugin } from "@types"
import { throwIfIsNotValid } from "@utils/throw-if-is-not-valid"
import { pluginValidator } from "@validators/plugin-validator"
import mongoose, { Types } from "mongoose"
import path from "path"
import { createWriteStream } from "fs"
import fs from "fs/promises"
import axios from "axios"
import { getDirname } from "@utils/get-dirname"

export const auth = AUTH()

export const createPlugin = POST<IPlugin>(async ({ res, user, next }, newPlugin) => {

    const pluginData = {
        ...newPlugin,
        userId: user._id
    }

    await throwIfIsNotValid({
        schema: pluginValidator,
        message: "The data sended is not valid for plugin",
        data: pluginData
    })

    const session = await mongoose.startSession()

    try {
        const plugin = new Plugin(pluginData)
        await session.withTransaction(async () => {
            await plugin.save()

            await User.findByIdAndUpdate(
                newPlugin._id,
                { $push: { plugins: plugin } }
            )
        })

        res.json({
            status: "success",
            message: "The plugin was created succesfully",
            data: [plugin]
        })

    } catch (error) {
        return next(error)
    } finally {
        session.endSession()
    }
})

export const listingPlugin = GET(async ({ res, user }) => {

    const plugins = await Plugin.find({ userId: user._id })

    res.json({
        status: "success",
        message: "Listing all plugins from the user",
        data: plugins
    })
})


export const deletePlugin = DELETE("/:id", async ({ res, req }) => {
    const id = req.params["id"]
    await Plugin.findByIdAndDelete(id).lean()
    res.json({
        status: "success",
        message: "The plugin was deleted succesfully",
        data: []
    })
})

export const usePlugin = POST<{ pluginId: string, fileId: string }>("/transform", async ({ user, res }, info) => {
    const plugin = await Plugin.findOne({
        userId: user._id,
        _id: info.pluginId
    }).lean()

    const file = await File.findOne({
        userId: user._id,
        _id: info.fileId
    }).lean()
    const fullUrl = `http://127.0.0.1:3000/file/${file?.previewUrl}`

    if (!file || !plugin) return
    const fileName = `${file.name}_${plugin.name}`
    const objectId = new Types.ObjectId()

    try {
        const response = await axios.post(
            plugin.url as string,
            { file: fullUrl },
            { responseType: "stream" }
        )
        const filePath = path.join(getDirname(),"uploads", objectId.toString())

        const writer = createWriteStream(filePath)
        //@ts-expect-error infweienfi
        response.data.pipe(writer)
        writer.on("finish", async () => {
            const info = await fs.stat(filePath)
            await File.create({
                name: fileName,
                size: info.size,
                mimeType: plugin.types[0],
                url: objectId,
                previewUrl: objectId,
                userId: user._id
            })
            res.json({
                status: "success",
                message: "The plugin was executed succesfully",
                data: []
            })
        })

    } catch (error) {
        res.json({
            status: "error",
            message: "The plugin was not working",
            data: []
        })
    }
})


export const updatePlugin = PATCH<IPlugin>("/:pluginId", async ({ req, user, res, next }, updatedPlugin) => {
    const { pluginId } = req.params

    const isPluginIdValid = Types.ObjectId.isValid(pluginId)
    if (!isPluginIdValid) return next(new ValidationError("The parameter for this route is invalid", [{
        field: "/plugin/:ObjectId", message: "the value for the param is a invalid objectId"
    }]))

    let plugin = await Plugin.findOne({ userId: user._id, _id: pluginId }).lean()
    plugin = { ...plugin, ...updatedPlugin }

    await throwIfIsNotValid({
        schema: pluginValidator,
        message: "The format for update a plugin is invalid",
        data: plugin
    })

    await Plugin.findByIdAndUpdate(pluginId, { $set: updatedPlugin })

    res.json({
        status: "success",
        message: "The plugin was updated succesfully",
        data: [updatedPlugin]
    })
})
