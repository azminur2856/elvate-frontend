"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { KeyRound, MapPin, Monitor, Moon, Palette, ShieldCheck, Sun, TriangleAlert, UserRound } from "lucide-react";
import api from "@/lib/authAxios";
import { getErrorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";
import { AddressBook } from "@/components/address/AddressBook";
import ChangePasswordModal from "@/components/modal/ChangePasswordModal";
import { DeleteAccount } from "@/components/settings/DeleteAccount";
import { DeviceSessions } from "@/components/settings/DeviceSessions";
import { FaceLoginSetting } from "@/components/settings/FaceLoginSetting";
import { LocalTime } from "@/components/shared/LocalTime";
import { PageShell } from "@/components/shared/PageShell";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { FormMessage } from "@/components/forms/FormMessage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SettingsTab } from "./tabs";


/** `GET /users/profile` (fields used here). */
type Profile = {
  firstName: string;
  lastName?: string | null;
  email: string;
  phone?: string | null;
  role: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isFaceVerified?: boolean;
  createdAt: string;
};

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function AccountTab() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    api
      .get<Profile>("/users/profile")
      .then((res) => setProfile(res.data))
      .catch((err) => setError(getErrorMessage(err, "Could not load your account.")));
  }, []);

  if (error) return <FormMessage variant="error">{error}</FormMessage>;
  if (!profile) return <Skeleton role="status" aria-label="Loading account" className="h-56 rounded-xl" />;

  const name = `${profile.firstName} ${profile.lastName ?? ""}`.trim();
  return (
    <Section title="Account" description="A summary of your account. Edit your details on the profile page.">
      <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-muted-foreground">Name</dt>
          <dd className="font-medium">{name}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">E-mail</dt>
          <dd className="flex flex-wrap items-center gap-2 font-medium">
            <span className="break-all">{profile.email}</span>
            <StatusBadge ok={profile.isEmailVerified} okLabel="Verified" noLabel="Not verified" />
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Phone</dt>
          <dd className="flex flex-wrap items-center gap-2 font-medium">
            {profile.phone || "—"}
            {profile.phone ? (
              <StatusBadge ok={profile.isPhoneVerified} okLabel="Verified" noLabel="Not verified" />
            ) : null}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Member since</dt>
          <dd className="font-medium">
            <LocalTime value={profile.createdAt} />
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Account type</dt>
          <dd>
            <Badge variant="secondary">{profile.role}</Badge>
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Face login</dt>
          <dd>
            <FaceLoginSetting
              enabled={Boolean(profile.isFaceVerified)}
              onChange={(enabled) => setProfile((p) => (p ? { ...p, isFaceVerified: enabled } : p))}
            />
          </dd>
        </div>
      </dl>
      <div className="mt-6 flex flex-wrap gap-2">
        <Button asChild>
          <Link href="/profile">Edit profile</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/orders">My orders</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/subscription/details">Subscription</Link>
        </Button>
      </div>
    </Section>
  );
}

const THEMES = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "Same as my device", icon: Monitor },
] as const;

function AppearanceTab() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <Section title="Appearance" description="Choose how Elvate looks on this device.">
      <fieldset>
        <legend className="sr-only">Theme</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {THEMES.map(({ value, label, icon: Icon }) => {
            const checked = mounted && theme === value;
            return (
              <label
                key={value}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl border p-4 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                  checked ? "border-primary ring-1 ring-primary" : "hover:border-input"
                )}
              >
                <input
                  type="radio"
                  name="theme"
                  value={value}
                  checked={checked}
                  onChange={() => setTheme(value)}
                  className="size-4 accent-primary"
                />
                <Icon aria-hidden="true" className="size-4 text-muted-foreground" />
                <span className="font-medium">{label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>
    </Section>
  );
}

function SecurityTab() {
  const [passwordOpen, setPasswordOpen] = useState(false);
  return (
    <div className="grid gap-6">
      <Section title="Password" description="Choose a strong password that you don't use on other sites.">
        <Button variant="outline" onClick={() => setPasswordOpen(true)}>
          <KeyRound aria-hidden="true" />
          Change password
        </Button>
        <ChangePasswordModal open={passwordOpen} onClose={() => setPasswordOpen(false)} />
      </Section>
      <Section title="Where you're signed in" description="Sign out of browsers you don't recognise.">
        <DeviceSessions />
      </Section>
    </div>
  );
}

export default function SettingsClient({ initialTab }: { initialTab: SettingsTab }) {
  const router = useRouter();
  const pathname = usePathname();
  const [tab, setTab] = useState<SettingsTab>(initialTab);

  const change = (value: string) => {
    const next = value as SettingsTab;
    setTab(next);
    router.replace(next === "account" ? pathname : `${pathname}?tab=${next}`, { scroll: false });
  };

  return (
    <PageShell width="lg" title="Settings" description="Manage your account, addresses, security and appearance.">
      <Tabs value={tab} onValueChange={change}>
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <TabsList aria-label="Settings sections">
            <TabsTrigger value="account">
              <UserRound aria-hidden="true" />
              Account
            </TabsTrigger>
            <TabsTrigger value="addresses">
              <MapPin aria-hidden="true" />
              Addresses
            </TabsTrigger>
            <TabsTrigger value="security">
              <ShieldCheck aria-hidden="true" />
              Security
            </TabsTrigger>
            <TabsTrigger value="appearance">
              <Palette aria-hidden="true" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="danger">
              <TriangleAlert aria-hidden="true" />
              Danger zone
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="account">
          <AccountTab />
        </TabsContent>
        <TabsContent value="addresses">
          <Section title="Saved addresses" description="Used at checkout. The default address is selected automatically.">
            <AddressBook mode="manage" />
          </Section>
        </TabsContent>
        <TabsContent value="security">
          <SecurityTab />
        </TabsContent>
        <TabsContent value="appearance">
          <AppearanceTab />
        </TabsContent>
        <TabsContent value="danger">
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-destructive">
                <TriangleAlert aria-hidden="true" className="size-5" />
                Delete account
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DeleteAccount />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
