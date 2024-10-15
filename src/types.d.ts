import { Types } from "mongoose"
import type { Request, Response, NextFunction } from "express"

export type Env = {
    NODE_ENV: string,
    PORT: number,
    DATABASE_NAME: string,
    DATABASE_PASSWORD: string,
    DATABASE_USERNAME: string,
    DATABASE_HOST: string,
    DATABASE_PORT: number,
    JWT_SECRET_KEY: string
}

type ISchemaBase = {
    _id: Types.ObjectId,
    createdAt: number,
    updatedAt: number,
}

export type IPlugin = ISchemaBase & {
    userId: Types.ObjectId,
    name: string,
    url: string,
    types: string[]
}

export type ICloud = ISchemaBase & {
    totalSize: number,
    usedSize: number,
    files: IFile[]
}

export type IFile = ISchemaBase & {
    userId: Types.ObjectId,
    name: string,
    mimeType: string,
    isFavorite: boolean,
    size: number,
    url: string,
    previewUrl: string
}

export type IUserRequest = ISchemaBase & {
    email: string,
    username: string,
    picture: IFile,
    cloud: ICloud
}

export type IUser = IUserRequest & {
    picture: IFile,
    password: string,
    confirmPassword: string,
    plugins: IPlugin[],
    cloud: ICloud
}

export type IFile = {
    userId: Types.ObjectId,
    name: string,
    ext: string,
    isFavorite: boolean,
    size: number,
    url: string,
    previewUrl: string
}

export type ICloud = {
    totalSize: number,
    usedSize: number,
    files: IFile[]
}

export type IForgotPassword = {
    password: string,
    confirmPassword: string
}

type IHandlerResult = void | Promise<void>

type IRouteHandlerJsonResponse = {
    status: "success" | "error" | "not-found" | "unauthorized" | "forbidden" | "bad-request" | "server-error",
    message: string,
    data: unknown[],
}

type IErrorHandlerJsonResponse = IRouteHandlerJsonResponse & {
    errors: unknown[]
}

export interface IResponse<T> extends Response {
    json: (data: T) => void
}

export interface IRequest<T = unknown> extends Request {
    user: IUserRequest
    body: T
}

type IHandlerContext<T, K = unknown> = {
    req: IRequest<K>,
    res: IResponse<T>,
    next: NextFunction
}

export interface IValidationError extends Error {
    errors: unknown[]
}

export type IErrorHandler<T extends Error> = (context: IHandlerContext<IErrorHandlerJsonResponse> & { err: T }) => IHandlerResult

export type IRouteHandler<T = unknown> = (
    context: IHandlerContext<IRouteHandlerJsonResponse, T> & { user: IUserRequest }
    , data: T
) => IHandlerResult

export type IExpressRouteHandler = (req: IRequest, res: Response, next: NextFunction) => IHandlerResult

export type IExpressErrorHandler<T> = (err: T, req: IRequest, res: Response, next: NextFunction) => IHandlerResult

type IHttpMethods = "get" | "put" | "post" | "delete" | "patch" | "all"

export type IHandlerDescriptor<T = IRouteHandler, E = Error> = {
    disabled: boolean,
    order: number,
    path?: string,
    method?: IHttpMethods,
    type: "controller" | "error" | "middleware",
    handler: T extends IRouteHandler ? IExpressRouteHandler : IExpressErrorHandler<E>
}

export type IFieldErrorDescriptor = {
    field: string,
    message: string
}

export type IAuth = {
    username: string
    password: string
}

export type IQuery = {
    keyword: string,
    order: "asc" | "desc",
    page: number
}

export type IAppJWTPayload = {
    _id: Types.ObjectId
}
