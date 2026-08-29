"use client";

import { useEffect, useState } from "react";
import api from "@/lib/authAxios";
import { formatDate, PLAN_LABELS } from "@/lib/format";
import { PageShell } from "@/components/shared/PageShell";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { PaginationControls } from "@/components/ui/pagination-controls";

type Subscription = {
  id: string;
  userId?: string | null;
  userName?: string | null;
  plan: "1m" | "6m" | "12m";
  isCancelled: boolean;
  startDate: string;
  endDate: string;
};

type Response = { subscriptions: Subscription[]; totalPages: number };

const PAGE_SIZE = 10;

export default function SubscriptionsClient() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get<Response>(`/subscriptions/getAllSubscriptions?page=${page}&pageSize=${PAGE_SIZE}`)
      .then((res) => {
        if (cancelled) return;
        setSubs(res.data.subscriptions);
        setTotalPages(res.data.totalPages);
      })
      .catch(() => {
        if (cancelled) return;
        setSubs([]);
        setTotalPages(1);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [page]);

  const columns: DataTableColumn<Subscription>[] = [
    { key: "sl", header: "#", align: "center", className: "w-12 text-muted-foreground", cell: (_, i) => (page - 1) * PAGE_SIZE + i + 1 },
    { key: "user", header: "User", cell: (s) => <span className="font-medium">{s.userName || "—"}</span> },
    { key: "plan", header: "Plan", cell: (s) => PLAN_LABELS[s.plan] ?? s.plan },
    { key: "start", header: "Start", cell: (s) => <span className="whitespace-nowrap text-muted-foreground">{formatDate(s.startDate)}</span> },
    { key: "end", header: "End", cell: (s) => <span className="whitespace-nowrap text-muted-foreground">{formatDate(s.endDate)}</span> },
    {
      key: "status",
      header: "Status",
      cell: (s) =>
        new Date(s.endDate) < new Date() ? (
          <Badge variant="destructive">Expired</Badge>
        ) : (
          <Badge variant="success">Active</Badge>
        ),
    },
    {
      key: "renew",
      header: "Auto-renew",
      cell: (s) =>
        s.isCancelled ? (
          <Badge variant="warning">Off</Badge>
        ) : (
          <Badge variant="success">On</Badge>
        ),
    },
  ];

  return (
    <PageShell width="xl" title="Subscription history" description="Every user subscription: plan, dates and renewal status.">
      <DataTable
        columns={columns}
        rows={subs}
        rowKey={(s) => s.id}
        loading={loading}
        loadingLabel="Loading subscriptions"
        emptyMessage="No subscriptions found."
        caption="Subscriptions"
      />
      <PaginationControls className="mt-6" page={page} totalPages={totalPages} onPageChange={setPage} />
    </PageShell>
  );
}
