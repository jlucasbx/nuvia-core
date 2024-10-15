import express from "express"
import { ERROR, MIDDLEWARE, USE } from "@decorators/http-handler"
import _morgan from "morgan"
import { getEnv } from "@utils/get-env"
import { ValidationError } from "@errors/validation-error"
import { UnauthorizedError } from "@errors/unauthorized-error"
import { AuthError } from "@errors/auth-error"
const { NODE_ENV } = getEnv()
const isDevelopment = NODE_ENV === "development"

export const morgan = USE(_morgan("dev"), !isDevelopment)

export const json = USE(express.json())

export const urlencoded = USE(express.urlencoded({ extended: true }))

export const extendsExpress = MIDDLEWARE(({ res, next }) => {
    //@ts-expect-error ignore-error
    if (res._json) return next()
    //@ts-expect-error ignore-error
    res._json = res.json
    res.json = (data) => {
        let result = data
        //@ts-expect-error ignore-error
        if (!data?.errors) result = {
            status: data.status,
            message: data.message,
            //@ts-expect-error ignore-error
            errors: [],
            data: data.data
        }
        //@ts-expect-error ignore-error
        res._json(result)
    }
    next()
})
export const catchUnauthorizedErros = ERROR<UnauthorizedError>(({ err, res, next }) => {
    if (!(err instanceof UnauthorizedError)) return next(err)
    res.status(422).json({
        status: "unauthorized",
        message: err.message,
        errors: [],
        data: []
    })
})


export const catchValidationErros = ERROR<ValidationError>(({ err, res, next }) => {
    if (!(err instanceof ValidationError)) return next(err)
    res.status(422).json({
        status: "error",
        message: err.message,
        errors: err.errors,
        data: []
    })
})

export const catchSyntaxErros = ERROR<SyntaxError>(({ err, res, next }) => {
    if (!(err instanceof SyntaxError)) return next(err)
    res.status(400).json({
        status: "error",
        message: "The json payload sended is invalid",
        errors: [],
        data: []
    })
})

export const catchAuthErrors = ERROR<AuthError>(({ err, res, next }) => {
    if (!(err instanceof AuthError)) return next(err)
    res.status(422).json({
        status: "error",
        message: err.message,
        errors: [],
        data: []
    })
})


export const catchAllErros = ERROR<Error>(({ err, res }) => {
    res.status(500).json({
        status: "error",
        message: isDevelopment ? err.message : "A error was ocurred",
        errors: [],
        data: []
    })
})
