import { POST } from "@decorators/http-handler"
import { AuthError } from "@errors/auth-error"
import { User } from "@models/user"
import { IAuth } from "@types"
import { appToken } from "@utils/app-token"
import { throwIfIsNotValid } from "@utils/throw-if-is-not-valid"
import { authValidator } from "@validators/auth-validator"
import argon2 from "argon2"

export const authUser = POST<IAuth>(async ({ res, next }, auth) => {

    await throwIfIsNotValid({
        schema: authValidator,
        message: "The provided credentials are not valid!!!",
        data: auth
    })

    const user = await User.findOne({ username: auth.username })
    if (!user) return next(new AuthError())
    const isPasswordValid = await argon2.verify(user.password, auth.password)
    if (!isPasswordValid) return next(new AuthError())
    const token = appToken.sign({ _id: user._id })

    res.json({
        status: "success",
        message: "The authentication token is created",
        data: [{ token: `Bearer ${token}` }]
    })
})
