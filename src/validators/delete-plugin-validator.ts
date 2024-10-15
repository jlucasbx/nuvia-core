import { z } from "zod"

export const deletePluginValidator = z.object({
    plugins: z.string().array().nonempty("plugins are empty")
})
