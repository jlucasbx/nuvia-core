import { User } from "@models/user"
import { z } from "zod"
import { usernameValidator } from "./username-validator"
import { extendPassowordsSchema } from "./passwords-validator"


const emailValidator = z.string()
    .email("Invalid email address")
    .refine(async (email) => !(await User.exists({ email })), {
        message: "The provided email already exists",
        path: ["email"]
    })

const usernameModelValidator = usernameValidator.regex(/^\S*$/,"Space in username is not allowed").refine(
    async (username) => !(await User.exists({ username })), {
    message: "The provided username already exists.",
    path: ["username"]
})

export const userValidator = extendPassowordsSchema({
    username: usernameModelValidator,
    email: emailValidator
})

export const userUpdateValidator = z.object({
    email: emailValidator.optional(),
    username: usernameModelValidator.optional()
})
