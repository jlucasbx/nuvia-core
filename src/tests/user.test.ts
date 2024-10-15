import { describe, expect, test } from "vitest"
import { publicRequest, authRequest } from "./utils"

describe("Create User", async () => {

    const request = await publicRequest()

    test("Creating a user returns a user", async () => {
        await request()
            .post("/user")
            .send({
                username: "jlucasbx",
                password: "password",
                confirmPassword: "password",
                email: "example@email.com"
            })
            .expect(200)
    })

    test("Invalid user data returns a ValidationError", async () => {
        const response = await request()
            .post("/user")
            .send({
                username: "",
                password: "password",
                confirmPassword: "pass_word",
                email: "user@g_mail.com"
            })
            .expect(422)
        expect(response.body.errors).toHaveLength(3)
    })

})

describe("Update User", async () => {

    test("Partialy Update a user return 200 status code", async () => {
        const request = await authRequest()
        const { body } = await request()
            .patch("/user")
            .send({
                username: "jlucasbx_updated",
                email: "usernew@gmail.com"
            }).expect(200)
    })

})

describe("Delete User", async () => {

    test("Deleting a user return 200 status code", async () => {
        const request = await authRequest()
        await request()
            .delete("/user")
            .expect(200)
    })

})
