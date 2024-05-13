import { z } from "zod"

import { PushEventSchema } from "@animadate/events-sdk/dist/sdk/types"

export const pushEventSchema = () => PushEventSchema
export const pushEventResponseSchema = () => z.object({ success: z.boolean() })
