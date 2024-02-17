import { NextRequest } from "next/server";
import { absoluteUrl } from "~/lib/utils";
import { env } from "~/env";
import { z } from "zod";

const DISCORD_AUTHORIZATION_URL = "https://discord.com/oauth2/authorize";
export const DISCORD_CALLBACK_PATH = "/api/discord/callback";
const DISCORD_TOKEN_URL = "https://discord.com/api/oauth2/token";

export const getDiscordAuthorizationUrl = (
  req: NextRequest,
  signature: string,
) =>
  `${DISCORD_AUTHORIZATION_URL}?${new URLSearchParams([
    // NOTE: Using an arrays to preserve order, so that the signature is last,
    //       and it's more likely to get cut off in screen shares or screenshots
    ["response_type", "code"],
    ["client_id", env.DISCORD_CLIENT_ID],
    ["scope", "identify guilds.join"],
    ["redirect_uri", getDiscordRedirectUrl(req)],
    ["prompt", "none"],
    ["state", signature],
  ])}`;

const getDiscordRedirectUrl = (req: NextRequest) =>
  absoluteUrl(DISCORD_CALLBACK_PATH, req).toString();

const accessTokenResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  expires_in: z.number().int(),
  refresh_token: z.string(),
  scope: z.string(),
});

export async function exchangeCodeForToken(code: string, req: NextRequest) {
  const response = await fetch(DISCORD_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: env.DISCORD_CLIENT_ID,
      client_secret: env.DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: getDiscordRedirectUrl(req),
    }),
  });
  if (!response.ok) {
    return {
      success: false,
      error: "Failed to exchange code for token",
    } as const;
  }

  const data = await response.json();
  return accessTokenResponseSchema.safeParseAsync(data);
}
