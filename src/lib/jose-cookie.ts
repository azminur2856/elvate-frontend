// lib/jose-cookie.ts
import { jwtDecrypt } from "jose";

// You should get your secret from env just like backend!
const secret = Buffer.from(process.env.COOKIES_SECRET!, "base64");

export async function decryptSessionCookie(cookie: string) {
  const { payload } = await jwtDecrypt(cookie, secret);
  return payload;
}
