import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    VERCEL_ENV: z
      .enum(["development", "preview", "production"])
      .default("production"),

    JOIN_TOKEN_SECRET: z.string(),
    FLOW_SESSION_SECRET: z.string(),

    DISCORD_CLIENT_ID: z.string(),
  },
  client: {},
  experimental__runtimeEnv: {},
});
