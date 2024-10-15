import { AUTH, POST } from "@decorators/http-handler"
import { User } from "@models/user"
import { IForgotPassword } from "@types"
import { throwIfIsNotValid } from "@utils/throw-if-is-not-valid"
import { forgotPasswordValidator } from "@validators/forgot-password-validator"
import * as argon from "argon2"


export const forgotPassword = AUTH(POST<IForgotPassword>(async ({ res, user }, data) => {
    await throwIfIsNotValid({
        schema: forgotPasswordValidator,
        data,
        message: "Validation error on passwords"
    })
    const hash = await argon.hash(data.password)
    await User.findOneAndUpdate(
        { username: user.username },
        { $set: { password: hash } }
    )
    res.json({
        status: "success",
        message: "The password is reseted sucessfully",
        data: []
    })
}))
