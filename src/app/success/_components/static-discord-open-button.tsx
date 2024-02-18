import {
  DiscordButton,
  DiscordButtonIcon,
} from "~/app/_components/discord-button";

export function StaticDiscordOpenButton(props: {
  joinGuildId: string;
  joinChannelId: string;
}) {
  return (
    <DiscordButton asChild>
      <a
        href={`https://discord.com/channels/${props.joinGuildId}/${props.joinChannelId}`}
      >
        <DiscordButtonIcon />
        Open Discord
      </a>
    </DiscordButton>
  );
}
