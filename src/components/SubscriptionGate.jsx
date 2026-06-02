import { Lock, Zap, Users, Building2, Phone, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const FEATURES = [
  { Icon: Users, text: "People Finder — 30 prospects per search with phone numbers" },
  { Icon: Building2, text: "Business Insurance Finder — 5 search categories" },
  { Icon: Phone, text: "AI-generated cold call opening lines for every contact" },
  { Icon: Zap, text: "Insurance potential scores (Car, Life, Health)" },
];

export default function SubscriptionGate({ featureName = "this feature" }) {
  return (
    <div className="mx-5 my-4">
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary to-primary/80 p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-3">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white mb-1">Pro Feature</h2>
          <p className="text-sm text-white/80">Unlock {featureName} with a Pro subscription</p>
        </div>

        {/* Price */}
        <div className="p-5 border-b border-border text-center">
          <div className="flex items-baseline justify-center gap-1 mb-1">
            <span className="text-4xl font-black text-foreground">$29</span>
            <span className="text-muted-foreground font-medium">/month</span>
          </div>
          <p className="text-sm text-muted-foreground">Cancel anytime · Instant access</p>
        </div>

        {/* Features */}
        <div className="p-5 space-y-3">
          {FEATURES.map(({ Icon, text }, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5 text-primary" />
              </div>
              <p className="text-sm text-foreground leading-snug">{text}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="px-5 pb-5">
          <Button className="w-full h-12 text-base font-bold rounded-xl" disabled>
            Subscribe — $29/month
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-2">
            Payment setup coming soon · Contact your admin to enable access
          </p>
        </div>
      </div>
    </div>
  );
}