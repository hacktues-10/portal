"use client";

import { useFormStatus } from "react-dom";
import { DiscordButton } from "~/app/_components/discord-button";

export function ConnectDiscordButton() {
  const { pending } = useFormStatus();
  return <DiscordButton isLoading={pending}>Свържи Discord</DiscordButton>;
}
