import { NextRequest } from "next/server";

export function absoluteUrl(url: string | URL, req: NextRequest) {
  const base = new URL(req.nextUrl.href);
  return new URL(url, base);
}

export function errorUrl(error: string, req: NextRequest) {
  return absoluteUrl(`/error/${error}`, req);
}
