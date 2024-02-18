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
    return NextResponse.redirect(errorUrl(req, "callback-error"));
  }

  const signature = req.nextUrl.searchParams.get("state");
  const state = req.cookies.get(flowStateCookieName)?.value;
  if (!signature || !state) {
    return NextResponse.redirect(errorUrl(req, "session-expired"));
  }
  const cookie = await verifyFlow(state, signature);
  if (!cookie.success) {
    return NextResponse.redirect(errorUrl(req, "session-expired"));
  }

  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(errorUrl(req, "callback-error"));
  }

  const accessTokenResponse = await exchangeCodeForToken(code, req);
  if (!accessTokenResponse.success) {
    // TODO: actual logging
    console.error(accessTokenResponse.error);
    return NextResponse.redirect(errorUrl(req, "callback-error"));
  }

  const currentUser = await getCurrentUser(accessTokenResponse.data);
  if (!currentUser.success) {
    // TODO: actual logging
    console.error(currentUser.error);
    return NextResponse.redirect(errorUrl(req, "callback-error"));
  }

  const joinAttempt = await addGuildMember(
    currentUser.data.id,
    accessTokenResponse.data.access_token,
    cookie.data,
  );
  if (!joinAttempt.success) {
    // TODO: actual logging
    console.error(joinAttempt.error);
    return NextResponse.redirect(errorUrl(req, "callback-error"));
  }

  if (!joinAttempt.createdNewMember) {
    const updateMemberAttempt = await updateGuildMember(
      currentUser.data.id,
      cookie.data,
    );
    if (!updateMemberAttempt.success) {
      // TODO: actual logging
      console.error(updateMemberAttempt.error);
      return NextResponse.redirect(errorUrl(req, "callback-error"));
    }
  }

  const redirectTo = absoluteUrl("/success", req);
  if (cookie.data.entry) {
    redirectTo.searchParams.set("entry", cookie.data.entry);
  }
  return NextResponse.redirect(redirectTo);
}
