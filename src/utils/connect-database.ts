import mongoose from "mongoose"
import { getEnv } from "./get-env"
const env = getEnv()

const isDev = env.NODE_ENV === "development"

export async function connectDatabase(name=env.DATABASE_NAME) {
    const uri = `mongodb://${env.DATABASE_USERNAME}:${env.DATABASE_PASSWORD}@${env.DATABASE_HOST}:${env.DATABASE_PORT}`

    try {
        return await mongoose.connect(uri, {
            dbName: name,
            serverSelectionTimeoutMS: isDev ? 1_000 : 10_000
        })

    } catch (error) {
        const typedError = error as Error
        console.error("\x1b[31m%s\x1b[0m", `DatabaseError: ${typedError.name}`)
        console.error("\x1b[31m%s\x1b[0m", `Message: ${typedError.message}`)
    }

}
