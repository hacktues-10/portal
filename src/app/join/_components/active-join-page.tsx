import { Payload } from "~/lib/token";
import { createFlow, flowStateCookieName } from "~/lib/flow";
import {
  DISCORD_CALLBACK_PATH,
  getDiscordAuthorizationUrl,
} from "~/lib/discord";
import { request } from "~/lib/hacks";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { HourglassIcon } from "~/app/_components/hourglass-icon";
import { ConnectDiscordButton } from "~/app/join/[token]/_components/connect-discord-button";

export function ActiveJoinPage(props: { payload: Payload }) {
  const initiateOAuthFlow = async () => {
    "use server";

    const state = await createFlow(props.payload);
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
    <div className="max-w-lg items-center space-y-5 justify-center">
      <div className="flex gap-5">
        <div className="w-1/3">
          <HourglassIcon />
        </div>
        <div className="flex flex-col justify-center gap-2">
          <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">
            Здравейте,
          </h1>
          <h2 className="text-3xl font-semibold tracking-tight">
            {props.payload.nick}!
          </h2>
        </div>
      </div>
      <p className="text-muted-foreground">
        Вие сте поканен/а да се присъедините към Discord сървъра на
        Hack&nbsp;TUES&nbsp;X.
      </p>
      <p className="text-muted-foreground">
        За да продължите, моля, свържете своя акаунт.
      </p>
      <form action={initiateOAuthFlow} className="text-center">
        <ConnectDiscordButton />
      </form>
    </div>
  );
}
