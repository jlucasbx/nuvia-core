import { App } from "@app"
import { User } from "@models/user"
import { appToken } from "@utils/app-token"
import { Application } from "express"
import supertest, { Test } from "supertest"
import TestAgent from "supertest/lib/agent"

let app: Application

async function createApp() {
    if (!app) app = await App()
    return app
}

export async function publicRequest() {
    const app = await createApp()
    return () => supertest(app)
}

function createProxyHandler(token: string): ProxyHandler<TestAgent<Test>> {
    return {
        get: (target, property, receiver) => {
            if (property === "get" ||
                property === "post" ||
                property === "put" ||
                property === "delete" ||
                property === "patch") {
                return (path: string) => {
                    return target[property](path).set("Authorization", `Bearer ${token}`)
                }
            }
            return Reflect.get(target, property, receiver)
        },
        set: (target, property, value, receiver) => Reflect.set(target, property, value, receiver)
    }
}

function generateRandomString(length: number) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    const result: string[] = []
    const charactersLength = characters.length

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charactersLength)
        const char = characters.charAt(randomIndex)
        result.push(char)
    }

    return result.join("")
}

export async function authRequest() {
    const app = await createApp()
    const password = generateRandomString(12)
    const user = new User({
        username: generateRandomString(12),
        password: password,
        confirmPassword: password,
        email: `${generateRandomString(12)}@gmail.com`
    })
    await user.save()
    const token = appToken.sign({ _id: user._id })
    const proxy = new Proxy(supertest(app), createProxyHandler(token))
    return () => proxy
}
