import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    JOIN_TOKEN_SECRET: z.string(),
  },
  client: {},
  experimental__runtimeEnv: {},
});
