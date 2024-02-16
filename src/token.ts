import { z } from "zod";
import jwt from "jsonwebtoken";

export const payloadSchema = z.object({
  nick: z.string().min(1).max(32),
  roles: z.array(z.string()),
});

export type Payload = z.infer<typeof payloadSchema>;

export function decode(token: string) {
  try {
    // TODO: use a real secret here
    const decoded = jwt.verify(token, "very secret, much wow!", {
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
