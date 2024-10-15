import { describe, expect, test } from "vitest"
import { authRequest } from "./utils"
import TestAgent from "supertest/lib/agent"
import { Test } from "supertest"
import { IPlugin } from "@types"

async function createPlugin(request: () => TestAgent<Test>, data?: Partial<IPlugin>) {
    const plugin = {
        name: "file-compressor",
        url: "https://api.com",
        types: ["jpg", "pdf", "mp3"]
    }

    const req = await request()
        .post("/plugin")
        .send(data || plugin)
        .expect(200)
    return req
}

describe("Create plugin", () => {

    test("Success creation of a plugin return status code 200", async () => {
        const request = await authRequest()
        const { body } = await createPlugin(request)
        expect(body.status).toBe("success")
        expect(body.message).toBe("The plugin was created succesfully")
        expect(body.errors).toHaveLength(0)
        expect(body.data).toHaveLength(1)
    })

    test("Attemp to create a plugin with invalid data returns a error", async () => {
        const request = await authRequest()
        const { body } = await request()
            .post("/plugin")
            .send({
                name: "",
                url: "",
                types: []
            })
            .expect(422)
        expect(body.status).toBe("error")
        expect(body.message).toBe("The data sended is not valid for plugin")
        expect(body.errors).toHaveLength(3)
        expect(body.data).toHaveLength(0)
    })
})

describe("Delete plugin", async () => {
    const request = await authRequest()
    await createPlugin(request)

    test("Deleting a plugin return status code 200", async () => {
        const { body } = await request()
            .delete("/plugin")
            .send({
                plugins: ["file-compressor"]
            })
            .expect(200)
        expect(body.status).toBe("success")
        expect(body.message).toBe("The plugin was deleted succesfully")
        expect(body.errors).toHaveLength(0)
        expect(body.data).toHaveLength(0)
    })

    test("Attemp to delete a plugin with invalid data returns a error", async () => {
        const { body } = await request()
            .delete("/plugin")
            .send({
                plugins: ["a-non-existent-plugin"]
            })
            .expect(422)
        expect(body.status).toBe("error")
        expect(body.message).toBe("Some plugins are not existent, anyone plugin is deleted")
        expect(body.errors).toHaveLength(1)
        expect(body.data).toHaveLength(0)
    })
})

describe("Update plugin", async () => {
    const request = await authRequest()
    const { body } = await createPlugin(request)
    const plugin = body.data[0]

    test("Update a plugin return status code 200", async () => {

        const types = ["docx", "pptx"]
        const name = "file-compressor-updated"

        const { body } = await request()
            .patch(`/plugin/${plugin._id}`)
            .send({ types, name })
            .expect(200)

        expect(body.status).toBe("success")
        expect(body.message).toBe("The plugin was updated succesfully")
        expect(body.errors).toHaveLength(0)
        expect(body.data).toHaveLength(1)
        expect(body.data[0].types).toStrictEqual(types)
        expect(body.data[0].name).toBe(name)
    })

    test("Attemp to update a plugin with invalid format returns a error", async () => {

        const { body } = await request()
            .patch(`/plugin/${plugin._id}`)
            .send({ types: [], name: "" })
            .expect(422)

        expect(body.status).toBe("error")
        expect(body.message).toBe("The format for update a plugin is invalid")
        expect(body.errors).toHaveLength(2)
        expect(body.data).toHaveLength(0)
    })
})

describe("Listing plugin", () => {

    test("Listing a plugin return status code 200", async () => {
        const request = await authRequest()
        for (let i = 1; i <= 10; i++) {
            await createPlugin(request, {
                name: `plugin-${1}`,
                url: "https://api.com",
                types: ["jpg"]
            })
        }
        const { body } = await request()
            .get("/plugin")
            .expect(200)
        expect(body.status).toBe("success")
        expect(body.message).toBe("Listing all plugins from the user")
        expect(body.errors).toHaveLength(0)
        expect(body.data).toHaveLength(10)
    })

})
