"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ExternalLink } from "lucide-react";
import api from "@/lib/authAxios";
import { getErrorMessage } from "@/lib/errors";
import { formatMoney, PLAN_LABELS } from "@/lib/format";
import { PageShell } from "@/components/shared/PageShell";
import { FormMessage } from "@/components/forms/FormMessage";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type CheckoutSession = {
  amount_total?: number | null;
  currency?: string | null;
  metadata?: { plan?: string } | null;
  invoice?: { hosted_invoice_url?: string | null } | string | null;
  invoice_url?: string | null;
  invoice_pdf?: string | null;
};

export default function PaymentSuccessClient() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError("No checkout session was found in the link.");
      setLoading(false);
      return;
    }
    api
      .get(`/subscriptions/session/${sessionId}`)
      .then((res) => setSession(res.data))
      .catch((err) => setError(getErrorMessage(err, "Failed to fetch the payment details.")))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) {
    return (
      <PageShell width="sm" title={<span className="sr-only">Checking your payment</span>} center>
        <Skeleton className="h-72 w-full" />
      </PageShell>
    );
  }

  if (error || !session) {
    return (
      <PageShell width="sm" title="Payment status" center>
        <div className="grid w-full gap-4">
          <FormMessage variant="error">{error || "Payment details not found."}</FormMessage>
          <Button asChild variant="outline">
            <Link href="/subscription/details">View your subscriptions</Link>
          </Button>
        </div>
      </PageShell>
    );
  }

  const invoiceUrl =
    (typeof session.invoice === "object" && session.invoice?.hosted_invoice_url) ||
    session.invoice_url ||
    session.invoice_pdf ||
    null;
  const amount = session.amount_total != null ? formatMoney(session.amount_total / 100) : null;
  const plan = session.metadata?.plan ? PLAN_LABELS[session.metadata.plan] ?? session.metadata.plan : null;

  return (
    <PageShell width="sm" center>
      <Card className="w-full text-center">
        <CardContent className="flex flex-col items-center gap-4 pt-6">
          <span className="flex size-14 items-center justify-center rounded-full bg-success/15 text-success">
            <CheckCircle2 aria-hidden="true" className="size-8" />
          </span>
          <h1 className="text-2xl font-bold">Payment successful</h1>
          <p className="text-muted-foreground">Thank you for subscribing. Your plan is active now.</p>
          <dl className="grid w-full grid-cols-2 gap-y-2 rounded-lg border border-border bg-muted/40 p-4 text-sm">
            <dt className="text-left text-muted-foreground">Amount paid</dt>
            <dd className="text-right font-mono tabular-nums">
              {amount ? `${amount} ${session.currency?.toUpperCase() ?? ""}` : "—"}
            </dd>
            <dt className="text-left text-muted-foreground">Plan</dt>
            <dd className="text-right">{plan ?? "—"}</dd>
          </dl>
          <div className="flex flex-wrap justify-center gap-2">
            {invoiceUrl ? (
              <Button asChild variant="outline">
                <a href={invoiceUrl} target="_blank" rel="noopener noreferrer">
                  Invoice <ExternalLink aria-hidden="true" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </Button>
            ) : null}
            <Button asChild>
              <Link href="/digitalServices">Go to digital services</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
