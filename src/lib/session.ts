import "server-only";
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

/** The logged-in user as client components may see it. Never the tokens. */
export type SessionUser = Session["user"];

/**
 * Picks the fields a client component needs. Anything passed from a server
 * component to a client component ends up in the page HTML, so never pass
 * the whole session (it holds the access and refresh tokens).
 */
export function toSessionUser(session: Session | null): SessionUser | null {
  if (!session?.user) return null;
  const { id, name, role, email, profileImage } = session.user;
  return { id, name, role, email, profileImage };
}

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
