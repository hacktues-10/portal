export function StaticDiscordJoinButton(props: {
  joinGuildId: string;
  joinChannelId: string;
}) {
  return (
    <a
      href={`https://discord.com/channels/${props.joinGuildId}/${props.joinChannelId}`}
    >
      Open Discord
    </a>
  );
}
