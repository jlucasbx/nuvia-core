import { UnauthorizedError } from "@errors/unauthorized-error"
import { User } from "@models/user"
import { IErrorHandler, IExpressRouteHandler, IHandlerDescriptor, IHttpMethods, IRequest, IRouteHandler, IUserRequest } from "@types"
import { appToken } from "@utils/app-token"
import { getEnv } from "@utils/get-env"
import { Types } from "mongoose"
const { NODE_ENV } = getEnv()
let count = 0

function errorDecorator(handler: IRouteHandler): IExpressRouteHandler {
    return async (req, res, next) => {
        try {
            await handler({ req, res, next, user: req.user }, req.body)
        } catch (err) {
            next(err)
        }
    }
}

function createHttpDecorator(method: IHttpMethods) {
    return function <T>(arg1: string | IRouteHandler<T>, arg2: IRouteHandler<T> | boolean = false, arg3 = false): IHandlerDescriptor {

        return ({
            disabled: typeof arg2 === "boolean" ? !!arg2 : arg3,
            type: "controller",
            order: ++count,
            method,
            path: typeof arg1 === "string" ? arg1 : "",
            handler: errorDecorator((typeof arg2 === "boolean" ? arg1 : arg2) as IRouteHandler)
        })
    }
}

export const GET = createHttpDecorator("get")
export const POST = createHttpDecorator("post")
export const DELETE = createHttpDecorator("delete")
export const PUT = createHttpDecorator("put")
export const PATCH = createHttpDecorator("patch")
export const ALL = createHttpDecorator("all")

export function ERROR<T extends Error>(handler: IErrorHandler<T>, disabled = false): IHandlerDescriptor<IErrorHandler<T>, T> {
    return {
        disabled,
        type: "error",
        order: ++count,
        method: undefined,
        path: undefined,
        handler: async (err, req, res, next) => {
            // eslint-disable-next-line
            if (NODE_ENV === "development") console.error(err)
            try {
                await handler({ err, req, res, next })
            } catch (err) {
                next(err)
            }
        }
    }
}

export const MIDDLEWARE = (handler: IRouteHandler, disabled = false): IHandlerDescriptor => ({
    disabled,
    type: "middleware",
    order: ++count,
    method: undefined,
    path: undefined,
    handler: errorDecorator(handler)
})

export const USE = (handler: IExpressRouteHandler, disabled = false): IHandlerDescriptor => ({
    disabled,
    type: "middleware",
    order: ++count,
    method: undefined,
    path: undefined,
    handler: async (req, res, next) => {
        try {
            await handler(req, res, next)
        } catch (err) {
            next(err)
        }
    }
})
export const AUTH = (desc?: IHandlerDescriptor): IHandlerDescriptor => {

    const verifyToken = (req: IRequest) => {
        const authHeader = req.headers["authorization"]?.replace("Bearer ", "")
        const result = appToken.verify(authHeader)
        return result
    }

    const lookupUser = async (_id: Types.ObjectId) => {
        return await User
            .findById(_id)
            .select("email username picture cloud")
            .lean()
            .exec() as IUserRequest
    }

    if (!desc) return MIDDLEWARE(async ({ req, next }) => {
        const r = verifyToken(req)
        if (!r.isValid) return next(new UnauthorizedError())
        req.user = await lookupUser(r.data._id)
        next()
    })

    return {
        ...desc,
        handler: async (req, res, next) => {
            const r = verifyToken(req)
            if (!r.isValid) return next(new UnauthorizedError())
            req.user = await lookupUser(r.data._id)
            await desc.handler(req, res, next)
        }
    }
}
