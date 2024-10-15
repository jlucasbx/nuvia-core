import { z } from "zod"

export const usernameValidator = z.string()
    .min(3, "Username have less than 3 caracters")
    .max(32, "Username hove more than 32 caracters")
