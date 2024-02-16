import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { errorUrl } from "~/utils";

export function GET(
  req: NextRequest,
  { params: { token } }: { params: { token: string } },
) {
  const decoded = decode(token);
  if (!decoded) {
    return NextResponse.redirect(errorUrl("expired", req));
  }

  return NextResponse.json({ decoded });
}

function decode(token: string) {
  try {
    // TODO: use a real secret here
    return jwt.verify(token, "very secret, much wow!");
  } catch (e) {
    if (e instanceof jwt.JsonWebTokenError) {
      return null;
    }
    // TODO: log `e` here
    throw e;
  }
}
