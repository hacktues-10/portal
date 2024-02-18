import { headers } from "next/headers";
import { NextRequest } from "next/server";

/**
 * Hackily get access to a {@link NextRequest} object for the current invocation
 * of a server component or action.
 */
export function request() {
  // HACK: trying Origin header
  const origin = headers().get("origin");
  if (origin) {
    return new NextRequest(origin);
  }
  // HACK: using Host header
  const host = headers().get("host");
  if (!host) {
    throw new Error("No host header");
  }
  return new NextRequest(`https://${host}`);
}
