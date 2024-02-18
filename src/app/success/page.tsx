import { env } from "~/env";
import { Suspense } from "react";
import { StaticDiscordJoinButton } from "~/app/success/_components/static-discord-join-button";
import { DynamicDiscordJoinButton } from "~/app/success/_components/dynamic-discord-join-button";

export default function JoinSuccessPage() {
  return (
    <div>
      <h1>Success</h1>
      <p>You have successfully joined the server!</p>
      <Suspense
        fallback={
          <StaticDiscordJoinButton
            joinGuildId={env.DISCORD_GUILD_ID}
            joinChannelId={env.DISCORD_DEFAULT_JOIN_CHANNEL_ID}
          />
        }
      >
        <DynamicDiscordJoinButton
          joinGuildId={env.DISCORD_GUILD_ID}
          defaultJoinChannelId={env.DISCORD_DEFAULT_JOIN_CHANNEL_ID}
        />
      </Suspense>
    </div>
  );
}
