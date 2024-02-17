import { NextRequest } from "next/server";
import { absoluteUrl } from "~/utils";
import { env } from "~/env";

const DISCORD_AUTHORIZATION_URL = "https://discord.com/oauth2/authorize";
export const DISCORD_CALLBACK_PATH = "/api/oauth2/discord/callback";

export const getDiscordAuthorizationUrl = (
  req: NextRequest,
  signature: string,
) =>
  `${DISCORD_AUTHORIZATION_URL}?${new URLSearchParams([
    ["response_type", "code"],
    ["client_id", env.DISCORD_CLIENT_ID],
    ["scope", "identify guilds.join"],
    ["redirect_uri", absoluteUrl(DISCORD_CALLBACK_PATH, req).toString()],
    ["prompt", "none"],
    ["state", signature],
  ])}`;
