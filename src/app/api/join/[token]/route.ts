import { NextRequest, NextResponse } from "next/server";
import { errorUrl } from "~/lib/utils";
import { decode } from "~/lib/token";
import { createFlow, flowStateCookieName } from "~/lib/flow";
import {
  DISCORD_CALLBACK_PATH,
  getDiscordAuthorizationUrl,
} from "~/lib/discord";

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
  const res = NextResponse.redirect(url);
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
