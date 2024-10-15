import dotenv from "dotenv"
import type { Env } from "@types"
dotenv.config()

function throwEnviromentError(envKeyName: string) {
    throw new Error(`Enviroment '${envKeyName}' not provided!!!`)
}

function _getEnv(): Env {
    const env = { ...process.env } as unknown as Env
    if (!env.PORT) throwEnviromentError("PORT")
    if (!env.DATABASE_HOST) throwEnviromentError("DATABASE_HOST")
    if (!env.DATABASE_NAME) throwEnviromentError("DATABASE_NAME")
    if (!env.DATABASE_PORT) throwEnviromentError("DATABASE_PORT")
    if (!env.DATABASE_PASSWORD) throwEnviromentError("DATABASE_PASSWORD")
    if (!env.DATABASE_USERNAME) throwEnviromentError("DATABASE_USERNAME")
    if (!env.JWT_SECRET_KEY) throwEnviromentError("JWT_SECRET_KEY")

    return {
        ...env,
        PORT: parseInt(process.env.PORT as string),
        DATABASE_PORT: parseInt(process.env.DATABASE_PORT as string)
    }
}


const env = _getEnv()

export function getEnv() {return env}
