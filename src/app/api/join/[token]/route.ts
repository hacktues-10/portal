import { NextRequest, NextResponse } from "next/server";
import { errorUrl } from "~/utils";
import { decode } from "~/token";
import { createFlow, flowStateCookieName } from "~/flow";
import { DISCORD_CALLBACK_PATH, getDiscordAuthorizationUrl } from "~/discord";
import { env } from "~/env";

export async function GET(
  req: NextRequest,
  { params: { token } }: { params: { token: string } },
) {
  const decoded = decode(token);
  if (!decoded.success) {
    return NextResponse.redirect(errorUrl("expired", req));
  }

  const state = await createFlow(decoded.data);

  const url = getDiscordAuthorizationUrl(req, state.signature);
  // TODO: redirect here
  // const res = NextResponse.redirect(url);
  const res = new NextResponse(url);
  res.cookies.set({
    name: flowStateCookieName,
    value: state.cookie,
    secure: true,
    httpOnly: true,
    path: DISCORD_CALLBACK_PATH,
    expires: state.expires,
  });
  return res;
}
