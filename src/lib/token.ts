import { z } from "zod";
import jwt from "jsonwebtoken";
import { env } from "~/env";

export const payloadSchema = z.object({
  nick: z.string().min(1).max(32),
  roles: z.array(z.string()),
  entry: z.string().optional(),
});

export type Payload = z.infer<typeof payloadSchema>;

export function decode(token: string) {
  try {
    const decoded = jwt.verify(token, env.JOIN_TOKEN_SECRET, {
      maxAge: "1w",
    });
    return payloadSchema.safeParse(decoded);
  } catch (e) {
    if (e instanceof jwt.JsonWebTokenError) {
      return { success: false } as const;
    }
    // TODO: log `e` here
    throw e;
  }
}
