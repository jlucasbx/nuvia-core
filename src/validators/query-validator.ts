import { z } from "zod"

export const queryValidator = z.object({
    keyword: z.string(),
    order: z.enum(["asc", "desc"]),
    page: z.number().min(1)
})
