import type { Metadata } from "next";
import ManageUsersClient from "./ManageUsersClient";

export const metadata: Metadata = { title: "Manage users" };

export default function ManageUsersPage() {
  return <ManageUsersClient />;
}
