import type { Metadata } from "next";
import ViewUsersClient from "./ViewUsersClient";

export const metadata: Metadata = { title: "Users" };

export default function ViewUsersPage() {
  return <ViewUsersClient />;
}
