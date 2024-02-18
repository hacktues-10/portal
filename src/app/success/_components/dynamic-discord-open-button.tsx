"use client";

import { useSearchParams } from "next/navigation";
import { StaticDiscordOpenButton } from "~/app/success/_components/static-discord-open-button";

export function DynamicDiscordOpenButton(props: {
  defaultJoinChannelId: string;
  joinGuildId: string;
}) {
  const joinChannelId = useJoinChannelId(props.defaultJoinChannelId);
  return (
    <StaticDiscordOpenButton
      joinGuildId={props.joinGuildId}
      joinChannelId={joinChannelId}
    />
  );
}

function useJoinChannelId(defaultJoinChannelId: string) {
  const searchParams = useSearchParams();
  const joinChannelId = searchParams.get("entry");
  if (!joinChannelId || !isValidSnowflake(joinChannelId)) {
    return defaultJoinChannelId;
  }
  return joinChannelId;
}

function isValidSnowflake(snowflake: string) {
  return /^\d{17,19}$/.test(snowflake);
}
