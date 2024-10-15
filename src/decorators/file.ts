import { IHandlerDescriptor } from "@types"
import { USE } from "./http-handler"
import { getStorage } from "@utils/connect-storage"
const storage = getStorage()

type fileMidleware = (field: string, desc?: IHandlerDescriptor) => IHandlerDescriptor

const fileBase = (field: string, desc: IHandlerDescriptor | undefined, type: "single" | "array"): IHandlerDescriptor => {
    const middleware = storage[type](field)
    if (!desc) return USE(middleware)
    return {
        ...desc,
        handler: (req, res, next) => {
            middleware(req, res, (err) => {
                if (err) return next(err)
                desc.handler(req, res, next)
            })
        }
    }
}

export const FILE: fileMidleware = (field, desc) => fileBase(field, desc, "single") 
export const FILES: fileMidleware = (field, desc) => fileBase(field, desc, "array") 
