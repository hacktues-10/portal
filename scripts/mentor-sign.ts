import jwt from "jsonwebtoken";
import { Payload } from "~/lib/token";
import { env } from "~/env";
import { MentorPayload } from "~/lib/mentors";

const payload = {
  id: 1997,
} satisfies MentorPayload;

const token = jwt.sign(payload, env.JOIN_TOKEN_SECRET, {
  expiresIn: "1w",
});

console.log(token);
