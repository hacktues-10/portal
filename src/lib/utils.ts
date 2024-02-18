import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { NextRequest } from "next/server";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
