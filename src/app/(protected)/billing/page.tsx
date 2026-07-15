"use client";

import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
  Shield,
  Zap,
  Gift,
  ArrowRight,
  Star,
  Check,
  Award,
} from "lucide-react";
import Script from "next/script";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// Simple confetti effect (no dependency)
const triggerConfetti = () => {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA0DD",
    "#FF9FF3",
    "#FFD93D",
  ];
  const container = document.createElement("div");
  container.style.cssText =
    "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;overflow:hidden;";
  document.body.appendChild(container);

  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement("div");
    const size = Math.random() * 8 + 4;
    const x = Math.random() * 100;
    const delay = Math.random() * 2;
    const duration = Math.random() * 2 + 2;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const rotation = Math.random() * 360;

    confetti.style.cssText = `
      position: absolute;
      top: -20px;
      left: ${x}%;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      transform: rotate(${rotation}deg);
      border-radius: ${Math.random() > 0.5 ? "50%" : "2px"};
      animation: confettiFall ${duration}s ease-in ${delay}s forwards;
    `;
    container.appendChild(confetti);
  }

  const style = document.createElement("style");
  style.textContent = `
    @keyframes confettiFall {
      0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
      100% { transform: translateY(${window.innerHeight + 100}px) rotate(${Math.random() * 720}deg) scale(0.5); opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  setTimeout(() => {
    container.remove();
    style.remove();
  }, 4000);
};

const BillingPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "failed">("idle");
  const [selectedPlan, setSelectedPlan] = useState<
    "pro" | "team" | "enterprise"
  >("pro");
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [creditsAdded, setCreditsAdded] = useState(0);

  const plans = {
    pro: {
      name: "Pro Developer",
      price: 299,
      description: "Perfect for individual developers",
      credits: 500,
      features: [
        "Unlimited code analysis",
        "AI-powered insights",
        "Priority support",
        "10 team members",
        "Advanced analytics",
      ],
      popular: true,
    },
    team: {
      name: "Team",
      price: 799,
      description: "Best for small teams",
      credits: 2000,
      features: [
        "Everything in Pro",
        "Unlimited team members",
        "Team collaboration",
        "Advanced security",
        "Custom integrations",
        "24/7 support",
      ],
      popular: false,
    },
    enterprise: {
      name: "Enterprise",
      price: 1999,
      description: "For large organizations",
      credits: 5000,
      features: [
        "Everything in Team",
        "Dedicated account manager",
        "Custom deployment",
        "SLA guarantee",
        "SSO & SAML",
        "Audit logs",
        "Data residency",
      ],
      popular: false,
    },
  };

  const currentPlan = plans[selectedPlan];
  const amount = currentPlan.price;

  // Handle success actions
  const handlePaymentSuccess = async (paymentData: any) => {
    try {
      // 1. Update user credits in database
      const creditsResponse = await fetch("/api/user/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credits: currentPlan.credits,
          plan: selectedPlan,
          paymentId: paymentData.razorpay_payment_id,
        }),
      });

      if (creditsResponse.ok) {
        const data = await creditsResponse.json();
        setCreditsAdded(data.creditsAdded || currentPlan.credits);
      }

      // 2. Update user's subscription status
      await fetch("/api/user/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan,
          status: "active",
          paymentId: paymentData.razorpay_payment_id,
        }),
      });

      // 3. Show success
      setPaymentDetails(paymentData);
      setShowSuccessDialog(true);
      triggerConfetti();
      setStatus("success");

      // 4. Show toast notification
      toast.success(`🎉 Welcome to ${currentPlan.name} Plan!`, {
        description: `You've been credited with ${currentPlan.credits} credits.`,
        duration: 5000,
      });
    } catch (error) {
      console.error("Error processing success actions:", error);
      toast.warning(
        "Payment successful but some features may take a moment to activate.",
      );
      setStatus("success");
      triggerConfetti();
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    setStatus("idle");

    try {
      // ✅ Using your existing /api/razorpay/order route
      const orderRes = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      const { orderId } = await orderRes.json();

      if (!orderId) throw new Error("Order creation failed");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        amount: amount * 100,
        currency: "INR",
        name: "CodeForge Tech",
        description: `${currentPlan.name} Plan Subscription`,
        order_id: orderId,
        // ✅ Using your existing /api/razorpay/verify route
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

          if (data.verified) {
            await handlePaymentSuccess(response);
          } else {
            setStatus("failed");
            toast.error("Payment verification failed. Please contact support.");
          }
        },
        theme: { color: "#3b82f6" },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      setStatus("failed");
      toast.error(
        error instanceof Error
          ? error.message
          : "Payment failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 text-center"
      >
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          <Sparkles className="h-3 w-3" />
          Choose Your Plan
        </div>
        <h1 className="mb-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Upgrade Your Development Power
        </h1>
        <p className="mx-auto max-w-2xl text-xs text-zinc-500 dark:text-zinc-400">
          Get unlimited access to AI-powered code analysis, team collaboration,
          and enterprise-grade security features.
        </p>
      </motion.div>

      {/* Plan Cards */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(plans).map(([key, plan], index) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            onClick={() => setSelectedPlan(key as any)}
            className={cn(
              "relative cursor-pointer rounded-xl border-2 p-4 transition-all hover:shadow-lg",
              selectedPlan === key
                ? "border-blue-500 bg-white shadow-md dark:bg-zinc-900/80"
                : "border-zinc-200 bg-white/50 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/30 dark:hover:border-zinc-700",
            )}
          >
            {plan.popular && (
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1 rounded-full bg-linear-to-r from-blue-600 to-indigo-600 px-2.5 py-0.5 text-[10px] font-semibold text-white shadow-md">
                  <Star className="h-3 w-3" />
                  Most Popular
                </span>
              </div>
            )}

            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  {plan.name}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {plan.description}
                </p>
              </div>
              {selectedPlan === key && (
                <div className="rounded-full bg-blue-500 p-0.5">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
            </div>

            <div className="mb-3">
              <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                ₹{plan.price}
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                /month
              </span>
              <div className="mt-1 text-xs text-blue-500">
                + {plan.credits} bonus credits
              </div>
            </div>

            <ul className="space-y-1.5">
              {plan.features.slice(0, 4).map((feature, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-400"
                >
                  <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-blue-500" />
                  {feature}
                </li>
              ))}
              {plan.features.length > 4 && (
                <li className="text-xs text-blue-500">
                  +{plan.features.length - 4} more
                </li>
              )}
            </ul>
          </motion.div>
        ))}
      </div>

      {/* Payment Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mx-auto max-w-2xl"
      >
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-md dark:border-zinc-800 dark:bg-zinc-900">
          {/* Summary */}
          <div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Selected Plan
                </p>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  {currentPlan.name} Plan
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Total
                </p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  ₹{amount}
                </p>
              </div>
            </div>
          </div>

          {/* Features Highlight */}
          <div className="border-b border-zinc-200 bg-zinc-50/50 p-3 dark:border-zinc-800 dark:bg-zinc-900/50">
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-blue-500" />
                Secure Payment
              </div>
              <div className="hidden h-4 w-px bg-zinc-300 sm:block dark:bg-zinc-700" />
              <div className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-blue-500" />
                Instant Access
              </div>
              <div className="hidden h-4 w-px bg-zinc-300 sm:block dark:bg-zinc-700" />
              <div className="flex items-center gap-1.5">
                <Gift className="h-3.5 w-3.5 text-blue-500" />
                {currentPlan.credits} Bonus Credits
              </div>
            </div>
          </div>

          {/* Status Messages */}
          <AnimatePresence>
            {status === "success" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="border-b border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900/30 dark:bg-emerald-950/20"
              >
                <div className="flex items-start gap-2 text-xs text-emerald-800 dark:text-emerald-400">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>
                    Payment successful! Welcome to the {currentPlan.name} plan.
                    <br />
                    You&apos;ve been credited with {currentPlan.credits}{" "}
                    credits.
                  </span>
                </div>
              </motion.div>
            )}

            {status === "failed" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="border-b border-rose-200 bg-rose-50 p-3 dark:border-rose-900/30 dark:bg-rose-950/20"
              >
                <div className="flex items-start gap-2 text-xs text-rose-800 dark:text-rose-400">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>
                    Payment failed. Please try again or contact support.
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Payment Button */}
          <div className="p-4">
            <button
              onClick={handlePayment}
              disabled={loading}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-blue-500/25 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <span>Subscribe Now</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>

            <p className="mt-3 text-center text-[10px] text-zinc-400 dark:text-zinc-500">
              Secured by Razorpay • 256-bit encryption
              <br />
              You can cancel anytime from your dashboard
            </p>
          </div>
        </div>
      </motion.div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <Award className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <DialogTitle className="text-center text-xl">
              🎉 Welcome to CodeForge!
            </DialogTitle>
            <DialogDescription className="text-center">
              Your {currentPlan.name} plan is now active. Start building amazing
              things!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 rounded-lg bg-zinc-50 p-4 dark:bg-zinc-900/50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                Plan
              </span>
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                {currentPlan.name}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                Credits Added
              </span>
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                +{currentPlan.credits}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                Payment ID
              </span>
              <span className="font-mono text-xs text-zinc-600 dark:text-zinc-400">
                {paymentDetails?.razorpay_payment_id?.slice(0, 12)}...
              </span>
            </div>
          </div>

          <DialogFooter className="flex flex-col gap-2 sm:flex-row">
            <Button
              onClick={() => router.push("/dashboard")}
              className="flex-1 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowSuccessDialog(false)}
              className="flex-1"
            >
              Continue Browsing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Trust Badges */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-8 flex flex-wrap items-center justify-center gap-4"
      >
        <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          Trusted by 10,000+ developers
        </div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          99.9% uptime guarantee
        </div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          Free cancellation
        </div>
      </motion.div>
    </div>
  );
};

export default BillingPage;
