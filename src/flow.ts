import { Payload, payloadSchema } from "~/token";
import { env } from "~/env";
import { z } from "zod";

const key = crypto.subtle.importKey(
  "raw",
  new TextEncoder().encode(env.FLOW_SESSION_SECRET),
  { name: "HMAC", hash: "SHA-256" },
  false,
  ["sign", "verify"],
);

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(hex: string) {
  return new Uint8Array(
    hex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)),
  );
}

function safeJSONParse<T>(input: string): T | null {
  try {
    return JSON.parse(input);
  } catch {
    return null;
  }
}

export const flowStateCookieName =
  env.VERCEL_ENV === "development" ? "state" : "__Secure-state";

export async function createFlow(payload: Payload) {
  const expires = new Date();
  expires.setHours(expires.getHours() + 1);
  const cookie = JSON.stringify({ ...payload, sex: expires.getTime() });
  const signature = toHex(
    await crypto.subtle.sign(
      "HMAC",
      await key,
      new TextEncoder().encode(cookie),
    ),
  );
  return {
    cookie,
    expires,
    signature,
  };
}

const stateCookieSchema = payloadSchema.extend({
  sex: z.number(),
});

export async function verifyFlow(state: string, signature: string) {
  const isValid = await crypto.subtle.verify(
    "HMAC",
    await key,
    fromHex(signature),
    new TextEncoder().encode(state),
  );
  if (!isValid) {
    return { success: false } as const;
  }
  const cookie = stateCookieSchema.safeParse(safeJSONParse(state));
  if (!cookie.success) {
    return cookie;
  }
  if (cookie.data.sex < Date.now()) {
    return { success: false } as const;
  }
  return cookie;
}
