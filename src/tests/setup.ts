import mongoose from "mongoose"
import { afterAll, vi } from "vitest"
import { getEnv } from "@utils/get-env"
const env = getEnv()
import multer from "multer"
import fs from "fs/promises"
/* eslint-disable no-console */

vi.mock("@utils/connect-database", () => {
    return {
        connectDatabase: async () => {
            const uri = `mongodb://${env.DATABASE_USERNAME}:${env.DATABASE_PASSWORD}@${env.DATABASE_HOST}:${env.DATABASE_PORT}`

            try {
            await mongoose.connect(uri, {
                    dbName: "testing",
                    serverSelectionTimeoutMS: 1_000
                })

            await clearDatabase()
            } catch (error) {
                const typedError = error as Error
                console.error("\x1b[31m%s\x1b[0m", `DatabaseError: ${typedError.name}`)
                console.error("\x1b[31m%s\x1b[0m", `Message: ${typedError.message}`)
            }
        }
    }
})

async function clearDatabase() {
    const db = mongoose.connection.db
    if (db.databaseName !== "testing") throw new Error("Invalid database for testing")
    await db.dropDatabase()
}

vi.mock("@utils/connect-storage", () => {
    return {
        storage: multer({ dest: "./test-uploads" }),
        connectStorage() {
            return this.storage
        },
        getStorage() {
            return this.storage
        }
    }
})


afterAll(async () => {
    await fs.rm("./test-uploads/**", { recursive: true, force: true })
})
