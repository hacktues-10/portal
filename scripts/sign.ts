import jwt from "jsonwebtoken";
import { Payload } from "~/token";

const payload = {
  nick: "alice",
  roles: ["admin", "user"],
} satisfies Payload;

const token = jwt.sign(payload, "very secret, much wow!", {
  expiresIn: "4w",
});

console.log(token);
