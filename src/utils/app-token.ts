import _jwt from "jsonwebtoken"
import { getEnv } from "./get-env"
import { IAppJWTPayload } from "@types"
import { Types } from "mongoose"
const { JWT_SECRET_KEY } = getEnv()

export function verify(token?: string): { isValid: boolean, data: IAppJWTPayload } {
    const err = { isValid: false, data: { _id: new Types.ObjectId() } }
    if (!token) return err
    try {
        const data = _jwt.verify(token, JWT_SECRET_KEY) as IAppJWTPayload
        return { data, isValid: true }
    } catch {
        return err
    }
}

export function sign(payload: IAppJWTPayload): string {
    const token = _jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: "2h" })
    return token
}

export function decode(token: string): IAppJWTPayload {
    const payload = _jwt.decode(token) as IAppJWTPayload
    return payload
}

export const appToken = { sign, verify, decode }
