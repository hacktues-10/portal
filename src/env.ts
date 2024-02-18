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
  },
  client: {},
  experimental__runtimeEnv: {},
});
