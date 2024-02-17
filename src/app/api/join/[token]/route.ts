import { NextRequest, NextResponse } from "next/server";
import { errorUrl } from "~/utils";
import { decode } from "~/token";
import { createFlow } from "~/flow";

export async function GET(
  req: NextRequest,
  { params: { token } }: { params: { token: string } },
) {
  const decoded = decode(token);
  if (!decoded.success) {
    return NextResponse.redirect(errorUrl("expired", req));
  }

  const state = await createFlow(decoded.data);

  return NextResponse.json({ state: state });
}
