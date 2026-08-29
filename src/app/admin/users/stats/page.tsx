import type { Metadata } from "next";
import UserStatsClient from "./UserStatsClient";

export const metadata: Metadata = { title: "User stats" };

export default function UserStatsPage() {
  return <UserStatsClient />;
}
