import { NextRequest, NextResponse } from "next/server";
import { errorUrl } from "~/utils";
import { flowStateCookieName, verifyFlow } from "~/flow";

export async function GET(req: NextRequest) {
  const signature = req.nextUrl.searchParams.get("state");
  const state = req.cookies.get(flowStateCookieName)?.value;
  if (!signature || !state) {
    return NextResponse.redirect(errorUrl("session-expired", req));
  }
  const cookie = await verifyFlow(state, signature);
  if (!cookie.success) {
    return NextResponse.redirect(errorUrl("session-expired2", req));
  }

  return NextResponse.json({ cookie: cookie.data });
}
