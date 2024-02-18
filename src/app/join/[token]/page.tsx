import { decode } from "~/lib/token";
import { relativeErrorUrl } from "~/lib/utils";
import { redirect } from "next/navigation";
import { createFlow, flowStateCookieName } from "~/lib/flow";
import {
  DISCORD_CALLBACK_PATH,
  getDiscordAuthorizationUrl,
} from "~/lib/discord";
import { cookies } from "next/headers";
import { request } from "~/lib/hacks";
import { ConnectDiscordButton } from "~/app/join/[token]/_components/connect-discord-button";

export default function JoinPage({ params }: { params: { token: string } }) {
  const token = decode(params.token);
  if (!token.success) {
    return redirect(relativeErrorUrl("expired"));
  }

  const initiateOAuthFlow = async () => {
    "use server";

    const state = await createFlow(token.data);
    const authorizationUrl = getDiscordAuthorizationUrl(
      request(),
      state.signature,
    );

    cookies().set({
      name: flowStateCookieName,
      value: state.cookie,
      secure: true,
      httpOnly: true,
      path: DISCORD_CALLBACK_PATH,
      expires: state.expires,
    });

    return redirect(authorizationUrl);
  };

  return (
    <div className="max-w-lg items-center space-y-5 justify-center text-center">
      <h1 className="scroll-m-20 text-3xl font-semibold tracking-tight">
        Здравейте, {token.data.nick}!
      </h1>
      <p className="text-muted-foreground">
        Вие сте поканен/а да се присъедините към Discord сървъра на
        Hack&nbsp;TUES&nbsp;X.
      </p>
      <p className="text-muted-foreground">
        За да продължите, моля, свържете своя Discord акаунт.
      </p>
      <form action={initiateOAuthFlow}>
        <ConnectDiscordButton />
      </form>
    </div>
  );
}
