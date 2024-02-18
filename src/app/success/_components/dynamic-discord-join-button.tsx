"use client";

import { useSearchParams } from "next/navigation";
import { StaticDiscordJoinButton } from "~/app/success/_components/static-discord-join-button";

export function DynamicDiscordJoinButton(props: {
  defaultJoinChannelId: string;
  joinGuildId: string;
}) {
  const joinChannelId = useJoinChannelId(props.defaultJoinChannelId);
  return (
    <StaticDiscordJoinButton
      joinGuildId={props.joinGuildId}
      joinChannelId={joinChannelId}
    />
  );
}

function useJoinChannelId(defaultJoinChannelId: string) {
  const searchParams = useSearchParams();
  const joinChannelId = searchParams.get("entrypoint");
  if (!joinChannelId || !isValidSnowflake(joinChannelId)) {
    return defaultJoinChannelId;
  }
  return joinChannelId;
}

function isValidSnowflake(snowflake: string) {
  return /^\d{17,19}$/.test(snowflake);
}
