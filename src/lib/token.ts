import { z } from "zod";
import jwt from "jsonwebtoken";
import { env } from "~/env";

export const payloadSchema = z.object({
  mentor: z.number().int().optional(),
  nick: z.string().min(1).max(32),
  roles: z.array(z.string()),
  entry: z.string().optional(),
});

export type Payload = z.infer<typeof payloadSchema>;

export function verify(token: string) {
  try {
    return {
      success: true,
      decoded: jwt.verify(token, env.JOIN_TOKEN_SECRET, {
        maxAge: "1w",
      }),
    };
  } catch (e) {
    if (e instanceof jwt.JsonWebTokenError) {
      return { success: false } as const;
    }
    // TODO: log `e` here
    throw e;
  }
}

export function decode(token: string) {
  const res = verify(token);
  if (!res.success) {
    return res;
  }
  return payloadSchema.safeParse(res.decoded);
}
