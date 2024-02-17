import { NextRequest, NextResponse } from "next/server";
import { absoluteUrl, errorUrl } from "~/lib/utils";
import { flowStateCookieName, verifyFlow } from "~/lib/flow";
import {
  addGuildMember,
  exchangeCodeForToken,
  getCurrentUser,
  updateGuildMember,
} from "~/lib/discord";

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

  const accessTokenResponse = await exchangeCodeForToken(code, req);
  if (!accessTokenResponse.success) {
    // TODO: actual logging
    console.error(accessTokenResponse.error);
    return NextResponse.redirect(errorUrl("callback-error", req));
  }

  const currentUser = await getCurrentUser(accessTokenResponse.data);
  if (!currentUser.success) {
    // TODO: actual logging
    console.error(currentUser.error);
    return NextResponse.redirect(errorUrl("callback-error", req));
  }

  const joinAttempt = await addGuildMember(
    currentUser.data.id,
    accessTokenResponse.data.access_token,
    cookie.data,
  );
  if (!joinAttempt.success) {
    // TODO: actual logging
    console.error(joinAttempt.error);
    return NextResponse.redirect(errorUrl("callback-error", req));
  }

  if (!joinAttempt.createdNewMember) {
    const updateMemberAttempt = await updateGuildMember(
      currentUser.data.id,
      cookie.data,
    );
    if (!updateMemberAttempt.success) {
      // TODO: actual logging
      console.error(updateMemberAttempt.error);
      return NextResponse.redirect(errorUrl("callback-error", req));
    }
  }

  return NextResponse.redirect(absoluteUrl("/success", req));
}
