import jwt from "jsonwebtoken";
import { Payload } from "~/lib/token";
import { env } from "~/env";

const payload = {
  nick: "Искам това име",
  roles: ["1199619938348974091"],
  entry: "1184449675227566082",
} satisfies Payload;

const token = jwt.sign(payload, env.JOIN_TOKEN_SECRET, {
  expiresIn: "1w",
});

console.log(token);
