import { request } from "@arcjet/next";
import { aj } from "./arcjet";

export async function protectRequest() {
  const req = await request();
  const decision = await aj.protect(req);

  if (decision.isDenied()) {
    throw new Error(`Request blocked by Arcjet`);
  }
  return decision;
}
