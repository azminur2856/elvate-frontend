"use client";

import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import api from "@/lib/authAxios";
import { formatDateTime, formatMoney } from "@/lib/format";
import { PageShell } from "@/components/shared/PageShell";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";

type Payment = {
  id: string;
  amount: number | string;
  currency: string;
  paidAt: string;
  invoiceUrl: string;
};

const columns: DataTableColumn<Payment>[] = [
  { key: "sl", header: "#", align: "center", className: "w-12 text-muted-foreground", cell: (_, i) => i + 1 },
  { key: "date", header: "Date", cell: (p) => <span className="whitespace-nowrap">{formatDateTime(p.paidAt)}</span> },
  { key: "amount", header: "Amount", numeric: true, cell: (p) => formatMoney(p.amount) },
  { key: "currency", header: "Currency", cell: (p) => p.currency.toUpperCase() },
  {
    key: "invoice",
    header: "Invoice",
    cell: (p) => (
      <Button asChild variant="outline" size="sm">
        <a href={p.invoiceUrl} target="_blank" rel="noopener noreferrer">
          View invoice
          <ExternalLink aria-hidden="true" />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </Button>
    ),
  },
];

export default function PaymentHistoryClient() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/subscriptions/paymentsHistory")
      .then((res) => setPayments(res.data))
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageShell width="md" title="Payment history" description="Your subscription payments and invoices.">
      <DataTable
        columns={columns}
        rows={payments}
        rowKey={(p) => p.id}
        loading={loading}
        loadingLabel="Loading payments"
        emptyMessage="No payments yet."
        caption="Your payments"
      />
    </PageShell>
  );
}
