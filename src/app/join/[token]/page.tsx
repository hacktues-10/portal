export default function JoinPage({
  params: { token },
}: {
  params: { token: string };
}) {
  return (
    <main>
      <h1>Join server</h1>
      <a href={`/api/join/${encodeURIComponent(token)}`}>Click to join</a>
    </main>
  );
}
