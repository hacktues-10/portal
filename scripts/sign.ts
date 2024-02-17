import jwt from "jsonwebtoken";
import { Payload } from "~/lib/token";
import { env } from "~/env";

const payload = {
  nick: "alice",
  roles: ["admin", "user"],
} satisfies Payload;

const token = jwt.sign(payload, env.JOIN_TOKEN_SECRET, {
  expiresIn: "4w",
});

console.log(token);
