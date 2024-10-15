import { describe, expect, test } from "vitest"
import { authRequest } from "./utils"

describe("Recover User Password", async () => {

    const route = "/forgot-password"

    test("Correct new password returns 200 status", async () => {
        const request = await authRequest()
        await request()
            .post(route)
            .send({
                password: "updatePassword",
                confirmPassword: "updatePassword"
            })
            .expect(200)
    })

    test("Wrong credentials returns a ValidationError and 422 status", async () => {
        const request = await authRequest()
        const response = await request()
            .post(route)
            .send({
                password: "updatePassword",
                confirmPassword: "updatePassword123"
            })
            .expect(422)

        expect(response.body).toStrictEqual({
            status: "error",
            message: "Validation error on passwords",
            errors: [
                {
                    "field": "confirmPassword",
                    "message": "Passwords do not match"
                }
            ],
            data: []
        })
    })
})
