import { AUTH, DELETE, GET, PATCH, POST } from "@decorators/http-handler"
import { Plugin } from "@models/plugin"
import { User } from "@models/user"
import { IUser } from "@types"
import { throwIfIsNotValid } from "@utils/throw-if-is-not-valid"
import { userUpdateValidator, userValidator } from "@validators/user-validator"


export const getUser = AUTH(GET(async ({ res, user }) => {
    const data = await User.findById(user._id).lean()
    const plugins = await Plugin.find({ userId: user._id }).lean()
    res.json({
        status: "success",
        message: "",
        data: [{...data,plugins}]
    })
}))


export const createUser = POST<IUser>(async ({ res }, newUser) => {

    await throwIfIsNotValid({
        schema: userValidator,
        data: newUser,
        message: "The values for User are invalid"
    })

    const user = new User(newUser)
    await user.save()
    res.json({
        status: "success",
        message: "The user was created",
        data: []
    })
})

export const updateUser = AUTH(PATCH<Partial<IUser>>(async ({ res, user }, partialUser) => {

    await throwIfIsNotValid({
        schema: userUpdateValidator,
        message: "Some provided values for user are not valid",
        data: partialUser
    })

    await User.findByIdAndUpdate(
        user._id,
        { $set: partialUser }
    )

    res.json({
        status: "success",
        message: "The user was updated",
        data: []
    })
}))

export const deleteUser = AUTH(DELETE(async ({ req, res }) => {
    await User.deleteOne({ username: req.user.username })
    res.json({
        status: "success",
        message: "The user was deleted",
        data: []
    })
}))
