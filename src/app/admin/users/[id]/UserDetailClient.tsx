"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { isAxiosError } from "axios";
import { ArrowLeft, ListFilter } from "lucide-react";
import api from "@/lib/authAxios";
import { getErrorMessage } from "@/lib/errors";
import { formatDate, formatDateTime } from "@/lib/format";
import { PageShell } from "@/components/shared/PageShell";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { userFullName } from "@/components/admin/UserPickerDialog";
import { initials } from "@/components/navbar/UserMenu";
import { FormMessage } from "@/components/forms/FormMessage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { Skeleton } from "@/components/ui/skeleton";

const IMAGEKIT = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
const PAGE_SIZE = 10;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** `GET /users/getUserById/:id` */
type UserDetail = {
  id: string;
  firstName: string;
  lastName: string | null;
  dob: string | null;
  email: string;
  phone: string | null;
  role: string;
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isFaceVerified: boolean;
  profileImage: string | null;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
  lastLogoutAt: string | null;
};

type Log = { id: number; activity: string; description: string; createdAt: string };
/** `GET /activity-logs/filter?userId=` */
type LogsResponse = { data: Log[]; total: number; totalPages: number };

function photoUrl(u: Pick<UserDetail, "id" | "profileImage">): string | undefined {
  if (!u.profileImage) return undefined;
  if (u.profileImage.startsWith("http")) return u.profileImage;
  if (!IMAGEKIT) return undefined;
  if (u.profileImage === "profile.png") return `${IMAGEKIT}/user_profile_image/${u.profileImage}`;
  return `${IMAGEKIT}/user_profile_image/user_${u.id}/${u.profileImage}`;
}

const logColumns = (page: number): DataTableColumn<Log>[] => [
  { key: "sl", header: "#", align: "center", className: "w-12 text-muted-foreground", cell: (_, i) => (page - 1) * PAGE_SIZE + i + 1 },
  { key: "activity", header: "Activity", cell: (l) => <span className="font-mono text-xs">{l.activity}</span> },
  { key: "description", header: "Description", className: "max-w-md break-words whitespace-normal", cell: (l) => l.description },
  { key: "date", header: "Date", cell: (l) => <span className="whitespace-nowrap text-muted-foreground">{formatDateTime(l.createdAt)}</span> },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-0.5">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="font-medium break-words">{children}</dd>
    </div>
  );
}

export default function UserDetailClient({ id }: { id: string }) {
  const [user, setUser] = useState<UserDetail | null>(null);
  const [userState, setUserState] = useState<"loading" | "ready" | "notFound" | "error">("loading");
  const [userError, setUserError] = useState("");

  const [logs, setLogs] = useState<Log[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logsError, setLogsError] = useState("");

  useEffect(() => {
    let cancelled = false;
    // Malformed ids make the backend fail with 500; don't even ask.
    if (!UUID_RE.test(id)) {
      setUserState("notFound");
      return;
    }
    setUserState("loading");
    api
      .get<UserDetail>(`/users/getUserById/${encodeURIComponent(id)}`)
      .then((res) => {
        if (cancelled) return;
        setUser(res.data);
        setUserState("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        const status = isAxiosError(err) ? err.response?.status : undefined;
        if (status === 404 || status === 400) setUserState("notFound");
        else {
          setUserError(getErrorMessage(err, "Could not load this user."));
          setUserState("error");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (userState !== "ready") return;
    let cancelled = false;
    setLogsLoading(true);
    setLogsError("");
    api
      .get<LogsResponse>("/activity-logs/filter", { params: { userId: id, page, limit: PAGE_SIZE } })
      .then((res) => {
        if (cancelled) return;
        setLogs(res.data.data ?? []);
        setTotal(res.data.total ?? 0);
        setTotalPages(Math.max(1, res.data.totalPages ?? 1));
      })
      .catch((err) => {
        if (cancelled) return;
        setLogs([]);
        setLogsError(getErrorMessage(err, "Could not load activity."));
      })
      .finally(() => !cancelled && setLogsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id, page, userState]);

  const back = (
    <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2 self-start">
      <Link href="/admin/users/view">
        <ArrowLeft aria-hidden="true" />
        All users
      </Link>
    </Button>
  );

  if (userState === "loading") {
    return (
      <PageShell width="xl">
        {back}
        <div role="status" aria-label="Loading user" className="grid gap-6">
          <div className="flex items-center gap-4">
            <Skeleton className="size-16 rounded-full" />
            <div className="grid gap-2">
              <Skeleton className="h-7 w-56" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
          <Skeleton className="h-56 w-full rounded-xl" />
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>
      </PageShell>
    );
  }

  if (userState === "notFound" || userState === "error" || !user) {
    return (
      <PageShell width="md">
        {back}
        <FormMessage variant="error" title={userState === "notFound" ? "User not found" : "Something went wrong"}>
          {userState === "notFound" ? "There is no user with this id. They may have been deleted." : userError}
        </FormMessage>
      </PageShell>
    );
  }

  const name = userFullName(user);

  return (
    <PageShell width="xl">
      {back}
      <header className="mb-8 flex flex-wrap items-center gap-4">
        <Avatar className="size-16">
          <AvatarImage src={photoUrl(user)} alt="" />
          <AvatarFallback className="text-lg">{initials(name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-3xl font-bold tracking-tight">{name}</h1>
          <p className="truncate text-muted-foreground">{user.email}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{user.role}</Badge>
          <StatusBadge ok={user.isActive} okLabel="Active" noLabel="Inactive" />
        </div>
      </header>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Phone">{user.phone || "—"}</Field>
              <Field label="Date of birth">{formatDate(user.dob)}</Field>
              <Field label="Joined">{formatDateTime(user.createdAt)}</Field>
              <Field label="Last login">{formatDateTime(user.lastLoginAt)}</Field>
              <Field label="Last logout">{formatDateTime(user.lastLogoutAt)}</Field>
              <Field label="Profile updated">{formatDateTime(user.updatedAt)}</Field>
              <Field label="E-mail verified">
                <StatusBadge ok={user.isEmailVerified} />
              </Field>
              <Field label="Phone verified">
                <StatusBadge ok={user.isPhoneVerified} />
              </Field>
              <Field label="Face login set up">
                <StatusBadge ok={user.isFaceVerified} />
              </Field>
            </dl>
          </CardContent>
        </Card>

        <section aria-labelledby="user-activity" className="grid gap-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="user-activity" className="text-lg font-semibold">
                Activity
              </h2>
              <p className="text-sm text-muted-foreground" aria-live="polite">
                {logsLoading ? "Loading…" : `${total} ${total === 1 ? "entry" : "entries"}`}
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/activity/logs?userId=${encodeURIComponent(user.id)}`}>
                <ListFilter aria-hidden="true" />
                Filter &amp; export
              </Link>
            </Button>
          </div>
          {logsError ? <FormMessage variant="error">{logsError}</FormMessage> : null}
          <DataTable
            columns={logColumns(page)}
            rows={logs}
            rowKey={(l) => String(l.id)}
            loading={logsLoading}
            loadingLabel="Loading activity"
            emptyMessage="No activity recorded for this user."
            caption={`Activity of ${name}`}
          />
          <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
        </section>
      </div>
    </PageShell>
  );
}
