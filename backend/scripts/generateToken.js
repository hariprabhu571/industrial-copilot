import "dotenv/config";
import { signToken } from "../src/auth/jwt.js";

const token = signToken({
  userId: "test-user-1",
  email: "user@company.com",
  role: "admin",
});

console.log("\nJWT TOKEN:\n");
console.log(token);
