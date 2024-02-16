import jwt from "jsonwebtoken";

const token = jwt.sign({ foo: "bar" }, "very secret, much wow!", {
  expiresIn: "1h",
});

console.log(token);
