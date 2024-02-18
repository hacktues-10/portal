import { env } from "~/env";
import { Suspense } from "react";
import { StaticDiscordOpenButton } from "~/app/success/_components/static-discord-open-button";
import { DynamicDiscordOpenButton } from "~/app/success/_components/dynamic-discord-open-button";

export default function JoinSuccessPage() {
  return (
    <div>
      <h1>Success</h1>
      <p>You have successfully joined the server!</p>
      <Suspense
        fallback={
          <StaticDiscordOpenButton
            joinGuildId={env.DISCORD_GUILD_ID}
            joinChannelId={env.DISCORD_DEFAULT_JOIN_CHANNEL_ID}
          />
        }
      >
        <DynamicDiscordOpenButton
          joinGuildId={env.DISCORD_GUILD_ID}
          defaultJoinChannelId={env.DISCORD_DEFAULT_JOIN_CHANNEL_ID}
        />
      </Suspense>
    </div>
  );
}
