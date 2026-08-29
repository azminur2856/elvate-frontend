"use client";

import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import api from "@/lib/authAxios";
import { formatDateTime, formatMoney } from "@/lib/format";
import { PageShell } from "@/components/shared/PageShell";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { PaginationControls } from "@/components/ui/pagination-controls";

type Payment = {
  id: string;
  userId?: string | null;
  userName?: string | null;
  amount: number;
  currency: string;
  invoiceUrl: string;
  paidAt: string;
};

type Response = { payments: Payment[]; totalPages: number };

const PAGE_SIZE = 10;

export default function PaymentsClient() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get<Response>(`/subscriptions/getAllPayments?page=${page}&pageSize=${PAGE_SIZE}`)
      .then((res) => {
        if (cancelled) return;
        setPayments(res.data.payments);
        setTotalPages(res.data.totalPages);
      })
      .catch(() => {
        if (cancelled) return;
        setPayments([]);
        setTotalPages(1);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [page]);

  const columns: DataTableColumn<Payment>[] = [
    { key: "sl", header: "#", align: "center", className: "w-12 text-muted-foreground", cell: (_, i) => (page - 1) * PAGE_SIZE + i + 1 },
    { key: "user", header: "User", cell: (p) => <span className="font-medium">{p.userName || "—"}</span> },
    { key: "amount", header: "Amount", numeric: true, cell: (p) => formatMoney(p.amount) },
    { key: "currency", header: "Currency", cell: (p) => p.currency.toUpperCase() },
    { key: "paidAt", header: "Paid at", cell: (p) => <span className="whitespace-nowrap text-muted-foreground">{formatDateTime(p.paidAt)}</span> },
    {
      key: "invoice",
      header: "Invoice",
      cell: (p) => (
        <Button asChild variant="link" size="sm" className="h-auto p-0 text-link">
          <a href={p.invoiceUrl} target="_blank" rel="noopener noreferrer">
            View invoice
            <ExternalLink aria-hidden="true" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </Button>
      ),
    },
  ];

  return (
    <PageShell width="xl" title="Payment history" description="All user payments, with invoice links.">
      <DataTable
        columns={columns}
        rows={payments}
        rowKey={(p) => p.id}
        loading={loading}
        loadingLabel="Loading payments"
        emptyMessage="No payments found."
        caption="Payments"
      />
      <PaginationControls className="mt-6" page={page} totalPages={totalPages} onPageChange={setPage} />
    </PageShell>
  );
}
