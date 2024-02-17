import { NextRequest } from "next/server";
import { headers } from "next/headers";

export function absoluteUrl(url: string | URL, req: NextRequest) {
  const base = new URL(req.nextUrl.href);
  return new URL(url, base);
}

export function relativeErrorUrl(error?: string) {
  if (!error) {
    return "/error";
  }
  return `/error/${error}`;
}

export function errorUrl(req: NextRequest, error?: string) {
  return absoluteUrl(relativeErrorUrl(error), req);
}

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
