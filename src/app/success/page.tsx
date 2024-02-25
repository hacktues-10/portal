import { env } from "~/env";
import { Suspense } from "react";
import { StaticDiscordOpenButton } from "~/app/success/_components/static-discord-open-button";
import { DynamicDiscordOpenButton } from "~/app/success/_components/dynamic-discord-open-button";

export const metadata = {
  title: "Успешно се присъединихте!",
  description: "Вече сте част от Discord сървъра на Hack TUES X.",
  openGraph: {
    title: "Успешно се присъединихте!",
    description: "Вече сте част от Discord сървъра на Hack TUES X.",
  },
};

export default function JoinSuccessPage() {
  return (
    <div className="space-y-3 text-center">
      <h1 className="text-3xl font-extrabold">Успешно се присъединихте!</h1>
      <p className="text-muted-foreground">
        Вече сте част от Discord сървъра на Hack&nbsp;TUES&nbsp;X.
      </p>
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
