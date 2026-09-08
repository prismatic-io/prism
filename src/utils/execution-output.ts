import { z } from "incur";

/** Each yielded value is a complete native incur stream event. */
export const executionEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("execution"),
    executionId: z.string(),
    integrationId: z.string().optional(),
    flowId: z.string().optional(),
    flowConfigId: z.string().optional(),
    response: z.unknown().optional(),
  }),
  z.object({
    type: z.literal("log"),
    executionId: z.string(),
    data: z.object({ timestamp: z.string(), severity: z.string(), message: z.string() }).partial(),
  }),
  z.object({
    type: z.literal("step-result"),
    executionId: z.string(),
    data: z.object({
      endedAt: z.string(),
      stepName: z.string(),
      result: z.record(z.string(), z.unknown()),
    }),
  }),
  z.object({ type: z.literal("listening"), integrationId: z.string(), listening: z.boolean() }),
  z.object({
    type: z.literal("payload"),
    executionId: z.string(),
    flowId: z.string(),
    path: z.string(),
  }),
  z.object({ type: z.literal("progress"), message: z.string() }),
  z.object({ type: z.literal("warning"), message: z.string() }),
  z.object({ type: z.literal("configuration-required"), instanceId: z.string(), url: z.string() }),
  z.object({
    type: z.literal("completed"),
    status: z.enum(["submitted", "completed", "timed-out", "not-configured", "listening-disabled"]),
    executionId: z.string().optional(),
    integrationId: z.string().optional(),
    flowId: z.string().optional(),
    path: z.string().optional(),
  }),
]);
export type ExecutionEvent = z.infer<typeof executionEventSchema>;
export const executionStreamOutputSchema = executionEventSchema;
