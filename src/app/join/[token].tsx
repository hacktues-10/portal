export default function JoinPage({ token }: { token: string }) {
  return (
    <main>
      <h1>Join server</h1>
      <a href={`/api/join/${encodeURIComponent(token)}`}>Click to join</a>
    </main>
  );
}
