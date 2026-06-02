import { Shield, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const scoreConfig = {
  High: {
    icon: CheckCircle2,
    gradient: "from-green-500 to-emerald-600",
    bg: "bg-green-50",
    text: "text-green-700",
    ring: "ring-green-200",
  },
  Medium: {
    icon: AlertTriangle,
    gradient: "from-amber-400 to-yellow-500",
    bg: "bg-amber-50",
    text: "text-amber-700",
    ring: "ring-amber-200",
  },
  Low: {
    icon: Shield,
    gradient: "from-slate-400 to-slate-500",
    bg: "bg-slate-50",
    text: "text-slate-600",
    ring: "ring-slate-200",
  },
};

export default function OpportunityResult({ result }) {
  const config = scoreConfig[result.score] || scoreConfig.Low;
  const Icon = config.icon;

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      {/* Score Header */}
      <div className={cn("bg-gradient-to-r p-5 text-white", config.gradient)}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-90">Opportunity Score</p>
            <p className="text-3xl font-bold mt-1">{result.score}</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
            <Icon className="w-7 h-7" />
          </div>
        </div>
        <p className="text-sm mt-2 opacity-80">ZIP Code: {result.zip}</p>
      </div>

      {/* Explanation */}
      <div className="p-5">
        <h4 className="text-sm font-semibold text-foreground mb-2">Analysis Summary</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {result.explanation}
        </p>

        {/* Data Points */}
        {result.factors && result.factors.length > 0 && (
          <div className="mt-4 space-y-2">
            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Key Factors
            </h5>
            {result.factors.map((factor, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-start gap-2 p-2.5 rounded-lg text-sm",
                  config.bg
                )}
              >
                <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 bg-gradient-to-r", config.gradient)} />
                <span className={config.text}>{factor}</span>
              </div>
            ))}
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            ⚠️ This analysis uses general area-level public data trends only. No individual people
            or properties are targeted or identified. For informational planning purposes only.
          </p>
        </div>
      </div>
    </div>
  );
}