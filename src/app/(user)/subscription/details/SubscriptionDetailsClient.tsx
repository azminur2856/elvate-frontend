"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import api from "@/lib/authAxios";
import { getErrorMessage } from "@/lib/errors";
import { formatDateTime, PLAN_LABELS } from "@/lib/format";
import { PageShell } from "@/components/shared/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";

type Subscription = {
  id: string;
  plan: string;
  startDate: string;
  endDate: string;
  status: string;
  daysLeft: number;
  isActive: boolean;
  isCancelled: boolean;
  autoRenewal: boolean;
};

export default function SubscriptionDetailsClient() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchSubs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/subscriptions/subscriptionDetails");
      setSubs(res.data);
    } catch {
      setSubs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSubs();
  }, [fetchSubs]);

  const confirmCancel = async () => {
    if (!cancelId) return;
    setCancelling(true);
    try {
      await api.post("/subscriptions/cancel", { subscriptionId: cancelId });
      toast.success("Auto-renewal turned off.");
      setCancelId(null);
      await fetchSubs();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to cancel the subscription."));
    } finally {
      setCancelling(false);
    }
  };

  const columns: DataTableColumn<Subscription>[] = [
    { key: "sl", header: "#", align: "center", className: "w-12 text-muted-foreground", cell: (_, i) => i + 1 },
    { key: "plan", header: "Plan", cell: (s) => <span className="font-medium">{PLAN_LABELS[s.plan] ?? s.plan}</span> },
    { key: "start", header: "Start", cell: (s) => <span className="whitespace-nowrap text-muted-foreground">{formatDateTime(s.startDate)}</span> },
    { key: "end", header: "End", cell: (s) => <span className="whitespace-nowrap text-muted-foreground">{formatDateTime(s.endDate)}</span> },
    { key: "daysLeft", header: "Days left", numeric: true, cell: (s) => (s.isActive ? s.daysLeft : 0) },
    {
      key: "renew",
      header: "Auto-renew",
      cell: (s) => (s.autoRenewal ? <Badge variant="success">On</Badge> : <Badge variant="secondary">Off</Badge>),
    },
    {
      key: "status",
      header: "Status",
      cell: (s) => (s.isActive ? <Badge variant="success">{s.status}</Badge> : <Badge variant="destructive">{s.status}</Badge>),
    },
    {
      key: "action",
      header: "Action",
      align: "center",
      cell: (s) =>
        s.autoRenewal ? (
          <Button variant="outline" size="sm" className="text-destructive" onClick={() => setCancelId(s.id)}>
            Cancel renewal
          </Button>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
  ];

  return (
    <PageShell
      width="xl"
      title="Your subscriptions"
      description="Current and past plans."
      actions={
        <Button asChild variant="outline">
          <Link href="/subscription">View plans</Link>
        </Button>
      }
    >
      <DataTable
        columns={columns}
        rows={subs}
        rowKey={(s) => s.id}
        loading={loading}
        loadingLabel="Loading subscriptions"
        emptyMessage="You don't have any subscriptions yet."
        caption="Your subscriptions"
      />

      <ConfirmDialog
        open={Boolean(cancelId)}
        onOpenChange={(o) => !o && !cancelling && setCancelId(null)}
        title="Cancel auto-renewal?"
        description="Your plan stays active until its end date, but it won't renew. This cannot be undone."
        confirmLabel="Cancel renewal"
        cancelLabel="Keep subscription"
        destructive
        loading={cancelling}
        onConfirm={confirmCancel}
      />
    </PageShell>
  );
}
