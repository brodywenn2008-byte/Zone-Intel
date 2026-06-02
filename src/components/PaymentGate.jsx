import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Zap, CheckCircle, Map, Phone, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const PRICE_ID = "price_1TZEOmK1KfJ13RchzhdPOfuS";

const FEATURES = [
  "AI-powered neighborhood intelligence",
  "Cold call scripts & territory analysis",
  "Business insurance prospecting",
  "Field canvassing & contact tracking",
  "Residential lead finder",
  "Route optimization",
];

export default function PaymentGate({ children }) {
  const [status, setStatus] = useState("loading"); // loading | unpaid | paid
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const checkPayment = async () => {
    try {
      const res = await base44.functions.invoke("verifyPayment", {});
      setStatus(res.data?.paid ? "paid" : "unpaid");
    } catch {
      setStatus("unpaid");
    }
  };

  useEffect(() => {
    // If returning from Stripe success, re-verify
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success") {
      // Remove param from URL
      window.history.replaceState({}, "", window.location.pathname);
    }
    checkPayment();
  }, []);

  const handleCheckout = async () => {
    // Block if running in iframe (editor preview)
    if (window.self !== window.top) {
      alert("Checkout only works from the published app, not the editor preview.");
      return;
    }

    setIsCheckingOut(true);
    try {
      const successUrl = `${window.location.origin}${window.location.pathname}?payment=success`;
      const cancelUrl = `${window.location.origin}${window.location.pathname}`;
      const res = await base44.functions.invoke("createCheckoutSession", {
        priceId: PRICE_ID,
        successUrl,
        cancelUrl,
      });
      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setIsCheckingOut(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{background: "linear-gradient(135deg, #0a1628 0%, #0d2044 50%, #091320 100%)"}}>
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (status === "paid") {
    return children;
  }

  // Paywall screen
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10 relative overflow-hidden" style={{background: "linear-gradient(135deg, #0a1628 0%, #0d2044 50%, #091320 100%)"}}>
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-20" style={{background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)", filter: "blur(60px)"}} />
      <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full opacity-10" style={{background: "radial-gradient(circle, #10b981 0%, transparent 70%)", filter: "blur(40px)"}} />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img
            src="https://media.base44.com/images/public/69f40310cfd7253e830b7dde/06cea6383_ChatGPTImageMay12026at12_39_03AM.png"
            alt="ZoneIntel"
            className="w-36 h-36 object-contain mb-2 drop-shadow-2xl"
          />
          <p className="text-sm font-medium mt-1" style={{color: "#64b5f6"}}>Your all-in-one field sales platform</p>
        </div>

        {/* Price card */}
        <div className="rounded-2xl p-6 mb-5 shadow-xl border" style={{background: "rgba(255,255,255,0.05)", borderColor: "rgba(59,130,246,0.4)", backdropFilter: "blur(12px)"}}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider" style={{color: "#64b5f6"}}>One-Time Access</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-4xl font-black text-white">$19.99</span>
                <span className="text-sm" style={{color: "#64b5f6"}}>/ forever</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{background: "rgba(59,130,246,0.2)"}}>
              <Zap className="w-6 h-6" style={{color: "#3b82f6"}} />
            </div>
          </div>

          <div className="space-y-2.5 mb-5">
            {FEATURES.map((f) => (
              <div key={f} className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 flex-shrink-0" style={{color: "#10b981"}} />
                <span className="text-sm text-white/80">{f}</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleCheckout}
            disabled={isCheckingOut}
            className="w-full h-12 text-base font-bold rounded-xl text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
            style={{background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)", boxShadow: "0 4px 24px rgba(37,99,235,0.4)"}}
          >
            {isCheckingOut ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
            ) : (
              "Get Access — $19.99"
            )}
          </button>
        </div>

        <p className="text-xs text-center" style={{color: "rgba(255,255,255,0.4)"}}>
          Secure payment via Stripe · Pay once, access forever
        </p>
      </div>
    </div>
  );
}