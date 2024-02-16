import { NextRequest, NextResponse } from "next/server";
import { errorUrl } from "~/utils";
import { decode } from "~/token";

export function GET(
  req: NextRequest,
  { params: { token } }: { params: { token: string } },
) {
  const decoded = decode(token);
  if (!decoded.success) {
    return NextResponse.redirect(errorUrl("expired", req));
  }

  return NextResponse.json({ payload: decoded.data });
}
