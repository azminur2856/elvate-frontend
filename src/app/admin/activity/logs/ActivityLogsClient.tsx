"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Download, FilterX } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "@/lib/authAxios";
import { downloadBlob, getBlobErrorMessage } from "@/lib/download";
import { getErrorMessage } from "@/lib/errors";
import { formatDateTime } from "@/lib/format";
import { PageShell } from "@/components/shared/PageShell";
import { UserPickerDialog, userFullName, type PickedUser } from "@/components/admin/UserPickerDialog";
import { FormField } from "@/components/forms/FormField";
import { FormMessage } from "@/components/forms/FormMessage";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ActivityLog = {
  id: number;
  activity: string;
  description: string;
  createdAt: string;
  userId: string | null;
  userFullName?: string | null;
};

/** `GET /activity-logs/getAllActivityLogs` */
type AllResponse = { logs: ActivityLog[]; total: number; totalPages: number };
/** `GET /activity-logs/filter` (no user names, `limit` instead of pageSize) */
type FilterResponse = { data: ActivityLog[]; total: number; totalPages: number };

const PAGE_SIZE = 10;
const ALL = "all";

/** "YYYY-MM-DD" from a date input → ISO at the start / end of that LOCAL day. */
function dayBoundary(day: string, end: boolean): string | undefined {
  if (!day) return undefined;
  const d = new Date(`${day}T${end ? "23:59:59.999" : "00:00:00"}`);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

const humanize = (type: string) =>
  type
    .toLowerCase()
    .split("_")
    .map((w, i) => (i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");

export default function ActivityLogsClient({ initialUserId }: { initialUserId?: string }) {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [user, setUser] = useState<PickedUser | null>(
    initialUserId ? { id: initialUserId, name: "Loading…" } : null
  );
  const [activity, setActivity] = useState(ALL);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [activityTypes, setActivityTypes] = useState<string[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [exporting, setExporting] = useState(false);

  const rangeError = from && to && from > to ? "The start date must be on or before the end date." : "";
  const filtered = Boolean(user || activity !== ALL || from || to);

  const filterParams = useMemo(
    () => ({
      userId: user?.id,
      activity: activity !== ALL ? activity : undefined,
      fromDate: dayBoundary(from, false),
      toDate: dayBoundary(to, true),
    }),
    [user?.id, activity, from, to]
  );

  // Activity types that actually occur, for the filter select.
  useEffect(() => {
    api
      .get<{ countByType: Record<string, number> }>("/activity-logs/stats")
      .then((res) => setActivityTypes(Object.keys(res.data.countByType ?? {}).sort()))
      .catch(() => setActivityTypes([]));
  }, []);

  // `?userId=` deep link (from the user detail page): resolve the name.
  useEffect(() => {
    if (!initialUserId) return;
    api
      .get<{ firstName?: string; lastName?: string }>(`/users/getUserById/${initialUserId}`)
      .then((res) => setUser((u) => (u?.id === initialUserId ? { id: initialUserId, name: userFullName(res.data) } : u)))
      .catch(() => setUser((u) => (u?.id === initialUserId ? { id: initialUserId, name: "Unknown user" } : u)));
  }, [initialUserId]);

  useEffect(() => {
    if (rangeError) return;
    let cancelled = false;
    setLoading(true);
    setLoadError("");
    const request = filtered
      ? api
          .get<FilterResponse>("/activity-logs/filter", { params: { ...filterParams, page, limit: PAGE_SIZE } })
          .then((res) => ({ logs: res.data.data ?? [], total: res.data.total, totalPages: res.data.totalPages }))
      : api
          .get<AllResponse>("/activity-logs/getAllActivityLogs", { params: { page, pageSize: PAGE_SIZE } })
          .then((res) => res.data);
    request
      .then((data) => {
        if (cancelled) return;
        setLogs(data.logs);
        setTotal(data.total ?? 0);
        setTotalPages(Math.max(1, data.totalPages ?? 1));
      })
      .catch((err) => {
        if (cancelled) return;
        setLogs([]);
        setTotal(0);
        setTotalPages(1);
        setLoadError(getErrorMessage(err, "Could not load activity logs."));
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [filtered, filterParams, page, rangeError]);

  // The filter endpoint returns user ids only: look up names we don't know yet.
  useEffect(() => {
    const missing = [
      ...new Set(logs.filter((l) => l.userId && !l.userFullName && !names[l.userId]).map((l) => l.userId as string)),
    ].filter((id) => id !== user?.id);
    if (!missing.length) return;
    let cancelled = false;
    Promise.allSettled(
      missing.map((id) =>
        api.get<{ firstName?: string; lastName?: string }>(`/users/getUserById/${id}`).then((r) => [id, userFullName(r.data)] as const)
      )
    ).then((results) => {
      if (cancelled) return;
      const found: Record<string, string> = {};
      results.forEach((r, i) => (found[missing[i]] = r.status === "fulfilled" ? r.value[1] : "Deleted user"));
      setNames((n) => ({ ...n, ...found }));
    });
    return () => {
      cancelled = true;
    };
  }, [logs, names, user?.id]);

  const nameFor = (l: ActivityLog) =>
    l.userFullName || (l.userId ? (l.userId === user?.id ? user.name : names[l.userId]) : null);

  const changeFilter = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setPage(1);
  };

  const clearFilters = () => {
    setUser(null);
    setActivity(ALL);
    setFrom("");
    setTo("");
    setPage(1);
  };

  const exportCsv = async () => {
    setExporting(true);
    try {
      const res = await api.get<Blob>("/activity-logs/export", { params: filterParams, responseType: "blob" });
      const stamp = new Date().toISOString().slice(0, 10);
      downloadBlob(res.data, `activity-logs-${stamp}.csv`);
      toast.success("CSV downloaded.");
    } catch (err) {
      toast.error(await getBlobErrorMessage(err, "Export failed."));
    } finally {
      setExporting(false);
    }
  };

  const columns: DataTableColumn<ActivityLog>[] = [
    { key: "sl", header: "#", align: "center", className: "w-12 text-muted-foreground", cell: (_, i) => (page - 1) * PAGE_SIZE + i + 1 },
    {
      key: "user",
      header: "User",
      cell: (l) => {
        const name = nameFor(l);
        if (!l.userId) return <span className="text-muted-foreground">—</span>;
        return (
          <Link href={`/admin/users/${l.userId}`} className="font-medium text-link hover:underline">
            {name ?? "View user"}
          </Link>
        );
      },
    },
    { key: "activity", header: "Activity", cell: (l) => <span className="font-mono text-xs">{l.activity}</span> },
    { key: "description", header: "Description", className: "max-w-md break-words whitespace-normal", cell: (l) => l.description },
    { key: "date", header: "Date", cell: (l) => <span className="whitespace-nowrap text-muted-foreground">{formatDateTime(l.createdAt)}</span> },
  ];

  return (
    <PageShell
      width="xl"
      title="Activity logs"
      description="Everything performed by admins and users."
      actions={
        <Button variant="outline" onClick={exportCsv} loading={exporting} disabled={Boolean(rangeError)}>
          {exporting ? null : <Download aria-hidden="true" />}
          Export CSV
        </Button>
      }
    >
      <section aria-label="Filters" className="mb-6 grid gap-4 rounded-xl border bg-card p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <UserPickerDialog value={user} onChange={changeFilter(setUser)} />
          <div className="grid gap-1.5">
            <Label htmlFor="activity-type">Activity</Label>
            <Select value={activity} onValueChange={changeFilter(setActivity)}>
              <SelectTrigger id="activity-type" className="w-full">
                <SelectValue placeholder="All activities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All activities</SelectItem>
                {activityTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {humanize(t)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <FormField id="from-date" label="From">
            <Input type="date" value={from} max={to || undefined} onChange={(e) => changeFilter(setFrom)(e.target.value)} />
          </FormField>
          <FormField id="to-date" label="To" error={rangeError || undefined}>
            <Input type="date" value={to} min={from || undefined} onChange={(e) => changeFilter(setTo)(e.target.value)} />
          </FormField>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {loading ? "Loading…" : `${total} ${total === 1 ? "log" : "logs"}${filtered ? " match these filters" : ""}`}
          </p>
          {filtered ? (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <FilterX aria-hidden="true" />
              Clear filters
            </Button>
          ) : null}
        </div>
      </section>

      {loadError ? (
        <FormMessage variant="error" className="mb-4">
          {loadError}
        </FormMessage>
      ) : null}

      <DataTable
        columns={columns}
        rows={logs}
        rowKey={(l) => String(l.id)}
        loading={loading}
        loadingLabel="Loading activity logs"
        emptyMessage={filtered ? "No activity logs match these filters." : "No activity logs found."}
        caption="Activity logs"
      />
      <PaginationControls className="mt-6" page={page} totalPages={totalPages} onPageChange={setPage} />
    </PageShell>
  );
}
