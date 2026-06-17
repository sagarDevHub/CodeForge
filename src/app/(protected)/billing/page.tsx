"use client";

import { AlertCircle, CheckCircle2, CreditCard, Loader2 } from "lucide-react";
import Script from "next/script";
import { useState } from "react";

const BillingPage = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "failed">("idle");

  const amount = 299;

  const handlePayment = async () => {
    setLoading(true);
    setStatus("idle");

    try {
      const orderRes = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      const { orderId } = await orderRes.json();

      if (!orderId) throw new Error();
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        amount: amount * 100,
        currency: "INR",
        name: "CodeForge Tech",
        description: "Sandbox Skill Integration Showcase",
        order_id: orderId,
        handler: async function (response: any) {
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const data = await verifyRes.json();
          setStatus(data.verified ? "success" : "failed");
        },
        theme: { color: "#3b82f6" },
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      setStatus("failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    // <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
    //   <Script
    //     src="https://checkout.razorpay.com/v1/checkout.js"
    //     strategy="lazyOnload"
    //   />
    //   <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl">
    //     <h1 className="mb-4 text-2xl font-bold">Razorpay Test Checkout</h1>

    //     <div className="mb-6 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-4">
    //       <span className="text-sm text-slate-400">Sandbox Access</span>
    //       <span className="text-xl font-black text-blue-400">₹{amount}</span>
    //     </div>

    //     {status === "success" && (
    //       <div className="mb-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-400">
    //         🎉 Payment Simulated & Cryptographically Verified!
    //       </div>
    //     )}

    //     {status === "failed" && (
    //       <div className="mb-6 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-400">
    //         ❌ Transaction or Verification Failed.
    //       </div>
    //     )}

    //     <button
    //       onClick={handlePayment}
    //       disabled={loading}
    //       className="w-full cursor-pointer rounded-xl bg-blue-600 py-3 font-bold transition hover:bg-blue-500 disabled:bg-slate-800"
    //     >
    //       {loading ? "Processing..." : "Launch Test Modal"}
    //     </button>
    //   </div>
    // </div>

    <div className="flex min-h-[calc(100vh-4rem)] w-full items-center justify-center bg-transparent p-6">
      {/* Dynamic script loading for the gateway widget */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Subscription Billing
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Manage your plan and test gateway tokens
            </p>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-800/50 dark:bg-zinc-900/50">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              Pro Developer Token Bundle
            </span>
            <span className="text-xs text-zinc-400 dark:text-zinc-500">
              Sandbox Test Transaction
            </span>
          </div>
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            ₹{amount}
          </span>
        </div>

        {/* Status Messages */}
        {status === "success" && (
          <div className="mb-6 flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-emerald-400">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Success! Payment hook cryptographically validated on backend.
            </span>
          </div>
        )}

        {status === "failed" && (
          <div className="mb-6 flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900/30 dark:bg-rose-950/20 dark:text-rose-400">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>Transaction or Verification Failed. Check file routes.</span>
          </div>
        )}

        <button
          onClick={handlePayment}
          disabled={loading}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Initializing Gateway...
            </>
          ) : (
            "Launch Test Modal"
          )}
        </button>
      </div>
    </div>
  );
};

export default BillingPage;
