import type { Metadata } from "next";
import UserDetailClient from "./UserDetailClient";

export const metadata: Metadata = { title: "User details" };

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <UserDetailClient id={id} />;
}
