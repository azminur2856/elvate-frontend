"use client";

import { useEffect, useState } from "react";
import { Clock, ShieldCheck } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "@/lib/authAxios";
import { getErrorMessage } from "@/lib/errors";
import { formatDate } from "@/lib/format";
import { PageShell } from "@/components/shared/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type PlanKey = "1m" | "6m" | "12m";

const PLANS: { key: PlanKey; name: string; days: number; desc: string; price: number; highlight?: boolean }[] = [
  { key: "1m", name: "1 month", days: 30, desc: "Monthly access. Cancel anytime.", price: 100 },
  { key: "6m", name: "6 months", days: 180, desc: "Save more with half-year access.", price: 500, highlight: true },
  { key: "12m", name: "12 months", days: 365, desc: "Best value for a full year.", price: 1000 },
];

type SubscriptionStatus = {
  isSubscribed: boolean;
  daysLeft: number;
  startDate: string | null;
  endDate: string | null;
};

export default function SubscriptionPlansClient() {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkout, setCheckout] = useState<PlanKey | null>(null);

  useEffect(() => {
    api
      .get("/subscriptions/status")
      .then((res) => setStatus(res.data))
      .catch(() => setStatus(null))
      .finally(() => setLoading(false));
  }, []);

  const startCheckout = async (plan: PlanKey) => {
    setCheckout(plan);
    try {
      const res = await api.post("/subscriptions/checkout", { plan });
      if (res.data?.url) {
        window.location.href = res.data.url;
        return;
      }
      toast.error("Could not start the checkout session.");
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not start the checkout session."));
    } finally {
      setCheckout(null);
    }
  };

  return (
    <PageShell
      width="xl"
      title="Choose your subscription"
      description="Unlock every digital tool. Payments are processed securely by Stripe and your plan activates instantly."
      center
    >
      <div className="mb-8 text-center" aria-live="polite">
        {loading ? (
          <Skeleton className="mx-auto h-7 w-56" />
        ) : status?.isSubscribed ? (
          <div className="grid justify-items-center gap-1">
            <Badge variant="success" className="text-sm">
              Subscribed · {status.daysLeft} day{status.daysLeft === 1 ? "" : "s"} left
            </Badge>
            <p className="text-sm text-muted-foreground">
              {formatDate(status.startDate)} – {formatDate(status.endDate)}
            </p>
          </div>
        ) : (
          <div className="grid justify-items-center gap-1">
            <Badge variant="secondary" className="text-sm">Not subscribed</Badge>
            <p className="text-sm text-muted-foreground">Choose a plan to get access.</p>
          </div>
        )}
      </div>

      <ul className="grid w-full gap-6 md:grid-cols-3">
        {PLANS.map((plan) => (
          <li key={plan.key}>
            <Card
              className={cn(
                "flex h-full flex-col text-center transition-shadow hover:shadow-lg",
                plan.highlight && "border-primary shadow-md"
              )}
            >
              <CardHeader>
                {plan.highlight ? (
                  <Badge variant="brand" className="mx-auto mb-2">Most popular</Badge>
                ) : null}
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription className="inline-flex items-center justify-center gap-1.5">
                  <Clock aria-hidden="true" className="size-4" />
                  {plan.days} days of access
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col items-center">
                <p className="font-heading text-4xl font-bold tabular-nums">
                  {plan.price}
                  <span className="ml-1 text-lg font-medium text-muted-foreground">৳</span>
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{plan.desc}</p>
                <Button
                  size="lg"
                  className="mt-auto w-full pt-2"
                  onClick={() => void startCheckout(plan.key)}
                  loading={checkout === plan.key}
                  disabled={checkout !== null}
                >
                  Subscribe
                </Button>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>

      <p className="mt-8 inline-flex items-center gap-2 text-sm text-muted-foreground">
        <ShieldCheck aria-hidden="true" className="size-4" />
        Secure checkout via Stripe. Your subscription activates immediately after payment.
      </p>
    </PageShell>
  );
}
