import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    VERCEL_ENV: z.enum(["development", "preview", "production"]),

    JOIN_TOKEN_SECRET: z.string(),
    FLOW_SESSION_SECRET: z.string(),

    DISCORD_CLIENT_ID: z.string(),
    DISCORD_CLIENT_SECRET: z.string(),
    DISCORD_GUILD_ID: z.string(),
    DISCORD_BOT_TOKEN: z.string(),
    DISCORD_DEFAULT_JOIN_CHANNEL_ID: z.string(),
    DISCORD_MENTOR_ROLE_ID: z.string(),
    DISCORD_MENTOR_JOIN_CHANNEL_ID: z.string().optional(),
    DISCORD_TECHNOLOGY_ROLES_MAP: z
      .string()
      .transform((arg) => JSON.parse(arg))
      .pipe(z.record(z.string(), z.string())),

    POSTGRES_URL: z.string().url(),
  },
  client: {},
  experimental__runtimeEnv: {},
});
