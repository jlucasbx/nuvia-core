import { ValidationError } from "@errors/validation-error"
import { ZodSchema } from "zod"

type IArgs = {
    message:string,
    schema:ZodSchema,
    data: unknown
}

export async function throwIfIsNotValid({data,message,schema}:IArgs) {
    const result = await schema.safeParseAsync(data)
    if (result.success) return
    const errors = result.error.issues.map(({ path, message }) => ({ field: path[0].toString(), message }))
    throw new ValidationError(message, errors)
}
