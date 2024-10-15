import { z } from "zod"

export const pluginValidator = z.object({
    url: z.string().url().max(100),
    name: z.string().min(5).max(32),
    types: z.string().array().nonempty()
})
