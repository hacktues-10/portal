import { Payload } from "~/token";
import { env } from "~/env";

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

export async function createFlow(payload: Payload) {
  const expires = new Date();
  expires.setHours(expires.getHours() + 1);
  const cookie = JSON.stringify({ ...payload, e: expires.getTime() });
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
