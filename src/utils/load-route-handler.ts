import { IHandlerDescriptor, IHttpMethods } from "@types"
import { Application, Router } from "express"
import { readdir } from "fs/promises"

function formatPath(path?: string) {
    if (!path) return ""
    return path.startsWith("/") ? path : `/${path}`
}

export async function loadRouterHandlers(app: Application) {

    const files = (await readdir("./src/router")).reduce((accumulator, value) => {
        const isIndexFile = value === "index.ts"
        const isHidden = value.startsWith("_")
        if (isIndexFile) accumulator.unshift(value)
        if (!isIndexFile && !isHidden) accumulator.push(value)
        return accumulator
    }, [] as string[])

    const errorDescriptors: IHandlerDescriptor[] = []

    for (const file of files) {
        const [fileName] = file.split(".")
        const module = await import(`../router/${file}`)
        const isIndex = "index" === fileName
        const router = isIndex ? app : Router()
        const routeDescriptors = []

        for (const routeHandlerName in module) {
            const routeDescriptor = module[routeHandlerName] as IHandlerDescriptor
            if(!routeDescriptor.disabled) routeDescriptors.push(routeDescriptor)
        }

        routeDescriptors.sort((a, b) => (a.order - b.order))

        for (const desc of routeDescriptors) {

            const handlerSetups = {
                //@ts-expect-error user
                "middleware": () => router.use(desc.handler),
                //@ts-expect-error user
                "controller": () => router[desc.method as IHttpMethods](formatPath(desc.path), desc.handler),
                "error": () => errorDescriptors.push(desc)
            }

            handlerSetups[desc.type]()
        }

        if (!isIndex) app.use(formatPath(fileName), router)

    }

    //@ts-expect-error user
    for (const desc of errorDescriptors) app.use(desc.handler)

}


