import { NextRequest } from "next/server";
import { absoluteUrl } from "~/lib/utils";
import { env } from "~/env";
import { z } from "zod";
import { FlowCookie } from "~/lib/flow";

const DISCORD_AUTHORIZATION_URL = "https://discord.com/oauth2/authorize";
export const DISCORD_CALLBACK_PATH = "/api/discord/callback";
const DISCORD_TOKEN_URL = "https://discord.com/api/oauth2/token";
const DISCORD_CURRENT_USER_URL = "https://discord.com/api/v10/users/@me";

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
    ["prompt", "consent"],
    ["state", signature],
  ])}`;

const preview = (req: NextRequest) =>
  env.VERCEL_ENV !== "preview"
    ? req
    : new NextRequest("http://localhost:3000", req);

const getDiscordRedirectUrl = (req: NextRequest) =>
  absoluteUrl(DISCORD_CALLBACK_PATH, preview(req)).toString();

const getDiscordGuildMemberUrl = (guildId: string, userId: string) =>
  `https://discord.com/api/v10/guilds/${guildId}/members/${userId}`;

const accessTokenResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  expires_in: z.number().int(),
  refresh_token: z.string(),
  scope: z.string(),
});

type AccessTokenResponse = z.infer<typeof accessTokenResponseSchema>;

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
  const data = (await response.json()) as unknown;
  if (!response.ok) {
    return {
      success: false,
      error: data,
    } as const;
  }

  return accessTokenResponseSchema.safeParseAsync(data);
}

const discordUserSchema = z.object({
  id: z.string(),
  // NOTE: This is not the full user object, but it's enough for our purposes
});

export async function getCurrentUser(accessTokenResponse: AccessTokenResponse) {
  const response = await fetch(DISCORD_CURRENT_USER_URL, {
    headers: {
      Authorization: `${accessTokenResponse.token_type} ${accessTokenResponse.access_token}`,
    },
  });
  const data = (await response.json()) as unknown;
  if (!response.ok) {
    return {
      success: false,
      error: data,
    } as const;
  }
  return discordUserSchema.safeParseAsync(data);
}

export async function addGuildMember(
  userId: string,
  accessToken: string,
  flowCookie: FlowCookie,
) {
  const response = await fetch(
    getDiscordGuildMemberUrl(env.DISCORD_GUILD_ID, userId),
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`,
        // TODO: add more details about token
        "X-Audit-Log-Reason": encodeURIComponent(
          `Присъединяване чрез лична покана`,
        ),
      },
      body: JSON.stringify({
        access_token: accessToken,
        nick: flowCookie.nick,
        roles: flowCookie.roles,
      }),
    },
  );

  if (!response.ok) {
    const data = (await response.json()) as unknown;
    return {
      success: false,
      error: data as unknown,
    } as const;
  }

  return {
    success: true,
    createdNewMember: response.status === 201,
  };
}

export async function updateGuildMember(
  userId: string,
  flowCookie: FlowCookie,
) {
  const response = await fetch(
    getDiscordGuildMemberUrl(env.DISCORD_GUILD_ID, userId),
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`,
        "X-Audit-Log-Reason": encodeURIComponent(
          `Повторно присъединяване чрез лична покана`,
        ),
      },
      body: JSON.stringify({
        nick: flowCookie.nick,
        roles: flowCookie.roles,
      }),
    },
  );
  if (!response.ok) {
    const data = (await response.json()) as unknown;
    return {
      success: false,
      error: data as unknown,
    } as const;
  }
  return {
    success: true,
  };
}

export async function sendMessage(
  channelId: string,
  content: string,
  notifiedUsers: string[],
  notifiedRoles: string[],
) {
  try {
    const response = await fetch(
      `https://discord.com/api/v10/channels/${channelId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`,
        },
        body: JSON.stringify({
          content,
          allowed_mentions: {
            users: notifiedUsers,
            roles: notifiedRoles,
          },
        }),
      },
    );
    if (!response.ok) {
      const data = (await response.json()) as unknown;
      return {
        success: false,
        error: data as unknown,
      } as const;
    }
    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error,
    } as const;
  }
}

export async function getChannelByName(name: string) {
  try {
    const response = await fetch(
      `https://discord.com/api/v10/guilds/${env.DISCORD_GUILD_ID}/channels`,
      {
        headers: {
          Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`,
        },
      },
    );
    if (!response.ok) {
      const data = (await response.json()) as unknown;
      return {
        success: false,
        error: data as unknown,
      } as const;
    }

    const data = await response.json();
    const channels = z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
          type: z.number().int(),
        }),
      )
      .safeParse(data);
    if (!channels.success) {
      return {
        success: false,
        error: channels.error,
      } as const;
    }
    const channel = channels.data.find(
      (channel) => channel.name === name && channel.type === 0,
    );
    if (!channel) {
      return {
        success: false,
        error: new Error(`Channel ${name} not found`),
      } as const;
    }
    return {
      success: true,
      data: channel,
    };
  } catch (error) {
    return {
      success: false,
      error,
    } as const;
  }
}
