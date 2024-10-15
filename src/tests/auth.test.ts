import { describe, expect, test } from "vitest"
import { publicRequest } from "./utils"
import { User } from "@models/user"
import { AuthError } from "@errors/auth-error"

describe("Authenticate User", async () => {

    const request = await publicRequest()

    const user = new User({
        username: "correctUsername",
        password: "correctPassword",
        confirmPassword: "correctPassword",
        email: "usuario_de_um_email@gmail.com"
    })

    await user.save()
    test("Successful login returns a token", async () => {
        const response = await request().post("/auth").send({ username: "correctUsername", password: "correctPassword" })
        expect(response.body.data[0].token).not.toBeUndefined()
    })

    test("Invalid credentials returns a ValidationError", async () => {
        const response = await request().post("/auth").send({ username: "12", password: "" }).expect(422)
        expect(response.body.errors).toHaveLength(2)
    })

    test("Wrong credentials returns a AuthError", async () => {
        const response = await request().post("/auth").send({ username: "correctUsername", password: "wrongpassword" })
        expect(response.body).toStrictEqual({
            status: "error",
            message: new AuthError().message,
            data: [],
            errors: []
        })
    })
})
