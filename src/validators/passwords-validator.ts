import { z, ZodRawShape } from "zod"

export const passwordValidator = z.string()
    .min(8, "Password is less than 8 caracters")
    .max(32, "Password is greater than 64 caracters")
    .regex(/^\S*$/, "Space is not allowed for password")

export function extendPassowordsSchema(schema: ZodRawShape) {
    return z.object({
        ...schema,
        password: passwordValidator,
        confirmPassword: passwordValidator
    }).refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"]
    })
}
