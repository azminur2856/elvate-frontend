"use client";
import { useEffect, useState } from "react";
import api from "@/lib/authAxios";
import { toast } from "react-hot-toast";
import { FaClock } from "react-icons/fa";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    key: "1m",
    name: "1 Month",
    days: 30,
    desc: "Monthly subscription. Cancel anytime.",
    price: 100,
  },
  {
    key: "6m",
    name: "6 Months",
    days: 180,
    desc: "Save more with half-year access.",
    price: 500,
  },
  {
    key: "12m",
    name: "12 Months",
    days: 365,
    desc: "Best value for yearly access.",
    price: 1000,
  },
];

type SubscriptionStatus = {
  isSubscribed: boolean;
  daysLeft: number;
  startDate: string | null;
  endDate: string | null;
};

export default function SubscriptionCardGrid() {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api
      .get("/subscriptions/status")
      .then((res) => setStatus(res.data))
      .catch(() => setStatus(null))
      .finally(() => setLoading(false));
  }, []);

  const handleCheckout = async (plan: "1m" | "6m" | "12m") => {
    setCheckoutLoading(plan);
    try {
      const res = await api.post("/subscriptions/checkout", { plan });
      if (res.data?.url) {
        window.location.href = res.data.url; // Redirect to Stripe checkout
      } else {
        toast.error("Failed to create Stripe session.");
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to create checkout session"
      );
    } finally {
      setCheckoutLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center pt-16 font-sans">
      <div className="w-full max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 text-center">
          Choose Your Subscription
        </h2>

        {/* Subscription Status */}
        <div className="mb-10 text-center">
          {loading ? (
            <span className="text-gray-400">Checking subscription...</span>
          ) : status?.isSubscribed ? (
            <div>
              <div className="inline-block px-3 py-1 rounded-full bg-green-700 text-green-100 font-semibold text-sm mb-2">
                Subscribed — {status.daysLeft} day
                {status.daysLeft > 1 ? "s" : ""} left
              </div>
              <div className="text-gray-300 text-xs">
                {status.startDate && (
                  <>From {new Date(status.startDate).toLocaleDateString()} </>
                )}
                {status.endDate && (
                  <>to {new Date(status.endDate).toLocaleDateString()}</>
                )}
              </div>
            </div>
          ) : (
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-red-800 text-red-200 font-semibold text-sm mb-2">
                Not Subscribed
              </span>
              <div className="text-gray-400 text-xs">
                Choose a plan to get access.
              </div>
            </div>
          )}
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-2 md:px-0">
          {PLANS.map((plan) => (
            <div key={plan.key} className="relative group">
              {/* Gradient border effect */}
              <div className="absolute inset-0 rounded-3xl z-0 pointer-events-none bg-gradient-to-br from-blue-400 via-purple-400 to-yellow-300 blur-lg opacity-40 group-hover:opacity-80 transition" />
              {/* Main Card */}
              <div
                className={cn(
                  "relative z-10 rounded-3xl px-8 py-10 flex flex-col items-center border border-neutral-700",
                  "bg-black/80 backdrop-blur-md shadow-xl",
                  "transition-transform group-hover:scale-105 group-hover:shadow-2xl"
                )}
              >
                <div className="text-2xl font-bold text-white mb-2 text-center">
                  {plan.name}
                </div>
                <div className="flex items-center justify-center text-blue-300 font-semibold mb-1 gap-2">
                  <FaClock size={16} />
                  <span>{plan.days} days</span>
                </div>
                <div className="text-4xl font-extrabold mb-2 mt-2 bg-gradient-to-r from-yellow-400 to-yellow-300 text-transparent bg-clip-text">
                  {plan.price} <span className="text-lg">৳</span>
                </div>
                <div className="text-sm text-gray-300 text-center mb-5">
                  {plan.desc}
                </div>
                <button
                  onClick={() =>
                    handleCheckout(plan.key as "1m" | "6m" | "12m")
                  }
                  disabled={!!checkoutLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-2 rounded-xl mt-auto text-lg transition disabled:opacity-50 shadow-lg focus:outline-none"
                >
                  {checkoutLoading === plan.key
                    ? "Redirecting..."
                    : "Subscribe"}
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 text-xs text-blue-300 text-center">
          Payments are securely processed via Stripe. Your subscription will
          activate instantly after payment.
        </div>
      </div>
    </div>
  );
}
