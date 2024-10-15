import { z } from "zod"
import { usernameValidator } from "./username-validator"
import { passwordValidator } from "./passwords-validator"

export const authValidator = z.object({
    username: usernameValidator,
    password:passwordValidator
})
