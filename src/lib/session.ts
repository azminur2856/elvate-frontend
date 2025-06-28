import { cookies } from "next/headers";
import { decryptSessionCookie } from "./jose-cookie";
import { Role } from "./enums/role.enum";

export type Session = {
  user: {
    id: string;
    name: string;
    role: Role;
    email: string;
    profileImage: string;
  };
  accessToken: string;
  refreshToken: string;
};

export async function getSession() {
  const cookie = (await cookies()).get("session")?.value;
  if (!cookie) {
    return null;
  }
  try {
    const session = await decryptSessionCookie(cookie); // DECRYPT here!
    return session as Session;
  } catch (err) {
    console.error("Failed to decrypt the session cookie", err);
    return null; // Don't redirect here; let middleware handle it
  }
}
