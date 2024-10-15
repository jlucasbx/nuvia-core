import { describe, expect, expectTypeOf, test } from "vitest"
import { authRequest } from "./utils"
import path from "path"
import { Test } from "supertest"
import TestAgent from "supertest/lib/agent"
import { IFile } from "@types"

async function uploadFile(request: () => TestAgent<Test>) {
    return await request()
        .post("/file")
        .attach("file", path.join(__dirname, "files", "upload.jpg"))
        .expect(200)
}

describe("Upload a file", () => {

    test("sending a file returns object the object tha represent the file", async () => {
        const request = await authRequest()
        const { body } = await uploadFile(request)
        expect(body.status).toBe("success")
        expect(body.message).toBe("The file is uploaded succesfully")
        expect(body.errors).toHaveLength(0)
        expectTypeOf(body.data).toMatchTypeOf<IFile[]>()
    })

    test("sending a empty file in request returns a error", async () => {
        const request = await authRequest()
        const { body } = await request()
            .post("/file")
            .attach("file", "")
            .expect(422)
        expect(body).toStrictEqual({
            status: "error",
            message: "The multipart/form is not valid",
            errors: [{ field: "file", message: "The file field in empty" }],
            data: []
        })
    })

})

describe("Delete a file", () => {

    test("Deleting a file successfuly returns status 200", async () => {
        const request = await authRequest()
        await uploadFile(request)
        await request()
            .delete("/file")
            .send({
                files: ["upload"]
            })
            .expect(200)
    })

    test("Atemp do delete a invalid file returns a ValidationError", async () => {
        const request = await authRequest()
        const { body } = await request()
            .delete("/file")
            .send({
                files: ["this-file-not-exits"]
            })
            .expect(422)
        expect(body).toStrictEqual({
            status: "error",
            message: "Some files provided not exists the operation was canceled",
            errors: [],
            data: []
        })
    })

})

describe("Read files from user", () => {

    test("Listing all files return the first page of files", async () => {
        const request = await authRequest()
        await uploadFile(request)
        const { body } = await request()
            .get("/file")
            .send({
                keyword: "china",
                order: "asc",
                page: 1
            })
            .expect(200)

        expectTypeOf(body.data).toMatchTypeOf<IFile>()
    })

    test("Listing file with  a invalid query returns a error", async () => {
        const request = await authRequest()
        await uploadFile(request)
        const { body } = await request()
            .get("/file")
            .send({
                keyword: "china",
                order: "asc"
            })
            .expect(422)

        expect(body.status).toBe("error")
        expect(body.message).toBe("The query is invalid")
        expect(body.errors).toHaveLength(1)
    })

})
