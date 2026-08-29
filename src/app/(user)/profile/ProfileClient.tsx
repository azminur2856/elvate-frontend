"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Camera, Mail, Phone } from "lucide-react";
import api from "@/lib/authAxios";
import { getErrorMessage } from "@/lib/errors";
import { formatDate, formatDateTime } from "@/lib/format";
import { initials } from "@/components/navbar/UserMenu";
import { PageShell } from "@/components/shared/PageShell";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { FormMessage } from "@/components/forms/FormMessage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import UpdateUserModal from "@/components/modal/UpdateUserModal";
import ChangePasswordModal from "@/components/modal/ChangePasswordModal";
import PhoneVerificationModal from "@/components/modal/PhoneVerificationModal";
import FaceVerificationModal from "@/components/modal/FaceVerificationModal";
import ProfileImageUploadModal from "@/components/modal/ProfileImageUploadModal";

type UserProfile = {
  id: string;
  firstName: string;
  lastName?: string;
  dob?: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  profileImage?: string;
  isFaceVerified?: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  lastLogoutAt?: string;
};

type SubscriptionStatus = {
  isSubscribed: boolean;
  daysLeft: number;
  startDate: string | null;
  endDate: string | null;
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[8rem_1fr] items-baseline gap-2 py-2 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="flex flex-wrap items-center gap-2">{children}</dd>
    </div>
  );
}

const NA = <span className="text-muted-foreground">Not set</span>;

export default function ProfileClient() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [imgSrc, setImgSrc] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);

  const [showUpdate, setShowUpdate] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const [faceModalOpen, setFaceModalOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const refetchUser = useCallback(async () => {
    const res = await api.get("/users/profile");
    setUser(res.data);
  }, []);

  useEffect(() => {
    let mounted = true;
    api
      .get("/users/profile")
      .then((res) => mounted && setUser(res.data))
      .catch((err) => mounted && setError(getErrorMessage(err, "Failed to load your profile.")))
      .finally(() => mounted && setLoading(false));
    api
      .get("/subscriptions/status")
      .then((res) => mounted && setSubscription(res.data))
      .catch(() => mounted && setSubscription(null));
    return () => {
      mounted = false;
    };
  }, []);

  // Profile image is served as a blob behind auth; keep it as an object URL.
  useEffect(() => {
    if (!user) return;
    let url: string | undefined;
    api
      .get("/users/profileImage", { responseType: "blob" })
      .then((res) => {
        url = URL.createObjectURL(res.data);
        setImgSrc(url);
      })
      .catch(() => setImgSrc(undefined));
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [user]);

  if (loading) {
    return (
      <PageShell width="sm" center>
        <div role="status" aria-label="Loading profile" className="grid w-full gap-4">
          <Skeleton className="mx-auto size-32 rounded-full" />
          <Skeleton className="mx-auto h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </PageShell>
    );
  }

  if (error || !user) {
    return (
      <PageShell width="sm" center>
        <FormMessage variant="error">{error || "Profile not found."}</FormMessage>
      </PageShell>
    );
  }

  const name = `${user.firstName} ${user.lastName ?? ""}`.trim();

  return (
    <PageShell width="sm" center>
      <Card className="w-full">
        <CardContent className="flex flex-col items-center pt-6">
          <div className="relative">
            <Avatar className="size-32 border-2 border-primary">
              <AvatarImage src={imgSrc} alt="" />
              <AvatarFallback className="text-3xl">{initials(name)}</AvatarFallback>
            </Avatar>
            <Button
              size="icon-sm"
              className="absolute -bottom-1 -right-1 rounded-full shadow"
              aria-label="Change profile photo"
              onClick={() => setShowProfileModal(true)}
            >
              <Camera aria-hidden="true" />
            </Button>
          </div>

          <h1 className="mt-4 text-center text-2xl font-bold">{name}</h1>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            <Badge variant="secondary" className="capitalize">{user.role.toLowerCase()}</Badge>
            {user.isActive ? <Badge variant="success">Active</Badge> : <Badge variant="destructive">Inactive</Badge>}
          </div>

          <dl className="mt-6 w-full divide-y divide-border">
            <Row label="Email">
              <span className="inline-flex items-center gap-1.5">
                <Mail aria-hidden="true" className="size-4 text-muted-foreground" />
                {user.email}
              </span>
              <StatusBadge ok={user.isEmailVerified} okLabel="Verified" noLabel="Not verified" />
            </Row>
            <Row label="Phone">
              <span className="inline-flex items-center gap-1.5">
                <Phone aria-hidden="true" className="size-4 text-muted-foreground" />
                {user.phone || NA}
              </span>
              {user.phone ? (
                <StatusBadge ok={user.isPhoneVerified} okLabel="Verified" noLabel="Not verified" />
              ) : null}
              {user.phone && !user.isPhoneVerified ? (
                <Button variant="link" size="sm" className="h-auto p-0 text-link" onClick={() => setPhoneModalOpen(true)}>
                  Verify now
                </Button>
              ) : null}
            </Row>
            <Row label="Face login">
              <StatusBadge ok={Boolean(user.isFaceVerified)} okLabel="Verified" noLabel="Not set up" />
              {!user.isFaceVerified ? (
                <Button variant="link" size="sm" className="h-auto p-0 text-link" onClick={() => setFaceModalOpen(true)}>
                  Set up face login
                </Button>
              ) : null}
            </Row>
            <Row label="Subscription">
              {subscription === null ? (
                <span className="text-muted-foreground">Checking…</span>
              ) : subscription.isSubscribed ? (
                <>
                  <Badge variant="success">
                    Active · {subscription.daysLeft} day{subscription.daysLeft === 1 ? "" : "s"} left
                  </Badge>
                  <span className="basis-full text-xs text-muted-foreground">
                    {formatDate(subscription.startDate)} – {formatDate(subscription.endDate)}
                  </span>
                </>
              ) : (
                <>
                  <Badge variant="secondary">Not subscribed</Badge>
                  <Button asChild variant="link" size="sm" className="h-auto p-0 text-link">
                    <Link href="/subscription">Subscribe</Link>
                  </Button>
                </>
              )}
            </Row>
            <Row label="Date of birth">{user.dob ? formatDate(user.dob) : NA}</Row>
            <Row label="Member since">{formatDate(user.createdAt)}</Row>
            <Row label="Last login">{user.lastLoginAt ? formatDateTime(user.lastLoginAt) : NA}</Row>
            <Row label="Last logout">{user.lastLogoutAt ? formatDateTime(user.lastLogoutAt) : NA}</Row>
          </dl>

          <div className="mt-6 grid w-full gap-2 sm:grid-cols-2">
            <Button onClick={() => setShowUpdate(true)}>Update profile</Button>
            <Button variant="secondary" onClick={() => setShowChangePassword(true)}>
              Change password
            </Button>
          </div>
        </CardContent>
      </Card>

      <UpdateUserModal
        open={showUpdate}
        onClose={() => setShowUpdate(false)}
        user={{ firstName: user.firstName, lastName: user.lastName, phone: user.phone }}
        onSuccess={() => void refetchUser()}
      />
      <ChangePasswordModal open={showChangePassword} onClose={() => setShowChangePassword(false)} />
      <PhoneVerificationModal
        open={phoneModalOpen}
        onClose={() => setPhoneModalOpen(false)}
        phone={user.phone || ""}
        onVerified={() => void refetchUser()}
      />
      <FaceVerificationModal
        open={faceModalOpen}
        onClose={() => setFaceModalOpen(false)}
        onVerified={() => void refetchUser()}
      />
      <ProfileImageUploadModal
        open={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSuccess={() => window.location.reload()}
      />
    </PageShell>
  );
}
