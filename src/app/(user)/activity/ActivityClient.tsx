"use client";

import { useEffect, useState } from "react";
import api from "@/lib/authAxios";
import { formatDateTime } from "@/lib/format";
import { PageShell } from "@/components/shared/PageShell";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { PaginationControls } from "@/components/ui/pagination-controls";

type ActivityLog = {
  id: number;
  activity: string;
  description: string;
  createdAt: string;
  userId: string | null;
};

type Response = { logs: ActivityLog[]; totalPages: number };

const PAGE_SIZE = 5;

export default function ActivityClient() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get<Response>(`/activity-logs/user?page=${page}&pageSize=${PAGE_SIZE}`)
      .then((res) => {
        if (cancelled) return;
        setLogs(res.data.logs);
        setTotalPages(res.data.totalPages);
      })
      .catch(() => {
        if (cancelled) return;
        setLogs([]);
        setTotalPages(1);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [page]);

  const columns: DataTableColumn<ActivityLog>[] = [
    { key: "sl", header: "#", align: "center", className: "w-12 text-muted-foreground", cell: (_, i) => (page - 1) * PAGE_SIZE + i + 1 },
    { key: "activity", header: "Activity", cell: (l) => <span className="font-medium">{l.activity}</span> },
    { key: "description", header: "Description", className: "max-w-md break-words whitespace-normal", cell: (l) => l.description },
    { key: "date", header: "Date", cell: (l) => <span className="whitespace-nowrap text-muted-foreground">{formatDateTime(l.createdAt)}</span> },
  ];

  return (
    <PageShell width="lg" title="Activity logs" description="Your latest account activity.">
      <DataTable
        columns={columns}
        rows={logs}
        rowKey={(l) => String(l.id)}
        loading={loading}
        loadingLabel="Loading activity"
        emptyMessage="No activity yet."
        caption="Your activity"
      />
      <PaginationControls className="mt-6" page={page} totalPages={totalPages} onPageChange={setPage} />
    </PageShell>
  );
}
