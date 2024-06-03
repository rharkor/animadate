import z from "zod"

export const wssAuthSchema = () =>
  z.object({
    userId: z.string(),
    uuid: z.string(),
  })
