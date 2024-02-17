import { decode } from "~/lib/token";
import { relativeErrorUrl, request } from "~/lib/utils";
import { redirect } from "next/navigation";
import { createFlow, flowStateCookieName } from "~/lib/flow";
import {
  DISCORD_CALLBACK_PATH,
  getDiscordAuthorizationUrl,
} from "~/lib/discord";
import { cookies } from "next/headers";

export default function JoinPage({ params }: { params: { token: string } }) {
  const token = decode(params.token);
  if (!token.success) {
    return redirect(relativeErrorUrl("expired"));
  }

  const initiateOAuthFlow = async () => {
    "use server";

    const state = await createFlow(token.data);

    const url = getDiscordAuthorizationUrl(request(), state.signature);

    cookies().set({
      name: flowStateCookieName,
      value: state.cookie,
      secure: true,
      httpOnly: true,
      path: DISCORD_CALLBACK_PATH,
      expires: state.expires,
    });
    return redirect(url);
  };

  return (
    <main>
      <h1>Hi, {token.data.nick}</h1>
      <form action={initiateOAuthFlow}>
        <button>Join</button>
      </form>
    </main>
  );
}
