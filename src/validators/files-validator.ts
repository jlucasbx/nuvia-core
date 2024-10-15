import { z } from "zod"

export const filesValidator = z.object({
    files: z.string().array().nonempty("files are empty")
})
