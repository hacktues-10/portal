import { NextRequest, NextResponse } from "next/server";
import { errorUrl } from "~/lib/utils";
import { flowStateCookieName, verifyFlow } from "~/lib/flow";
import { exchangeCodeForToken } from "~/lib/discord";

export async function GET(req: NextRequest) {
  const errorCode = req.nextUrl.searchParams.get("error");
  if (errorCode) {
    const errorDescription = req.nextUrl.searchParams.get("error_description");
    const errorUri = req.nextUrl.searchParams.get("error_uri");
    // TODO: actual logging
    console.error({ errorCode, errorDescription, errorUri });
    return NextResponse.redirect(errorUrl("callback-error", req));
  }

  const signature = req.nextUrl.searchParams.get("state");
  const state = req.cookies.get(flowStateCookieName)?.value;
  if (!signature || !state) {
    return NextResponse.redirect(errorUrl("session-expired", req));
  }
  const cookie = await verifyFlow(state, signature);
  if (!cookie.success) {
    return NextResponse.redirect(errorUrl("session-expired", req));
  }

  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(errorUrl("callback-error", req));
  }

  const exchangeResponse = await exchangeCodeForToken(code, req);
  if (!exchangeResponse.success) {
    // TODO: actual logging
    console.error(exchangeResponse.error);
    return NextResponse.redirect(errorUrl("callback-error", req));
  }
  return NextResponse.json(exchangeResponse.data);
}
