import HeroSectionClient from "./HeroSectionClient";
import { getSession, toSessionUser } from "@/lib/session";

export default async function Home() {
  const user = toSessionUser(await getSession());
  return <HeroSectionClient user={user} />;
}
