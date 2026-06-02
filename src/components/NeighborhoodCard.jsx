import { TrendingUp, TrendingDown, Minus, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const trendConfig = {
  rising: { icon: TrendingUp, label: "Rising", color: "text-green-600 bg-green-50" },
  stable: { icon: Minus, label: "Stable", color: "text-amber-600 bg-amber-50" },
  declining: { icon: TrendingDown, label: "Declining", color: "text-red-500 bg-red-50" },
};

const rankBadgeColors = [
  "from-amber-400 to-yellow-500",
  "from-slate-300 to-slate-400",
  "from-amber-600 to-amber-700",
];

export default function NeighborhoodCard({ neighborhood, isTop3 }) {
  const trend = trendConfig[neighborhood.market_trend] || trendConfig.stable;
  const TrendIcon = trend.icon;
  const rankIdx = neighborhood.rank - 1;

  return (
    <div
      className={cn(
        "bg-card rounded-xl p-4 border transition-all duration-300",
        isTop3
          ? "border-primary/30 shadow-md shadow-primary/5"
          : "border-border shadow-sm"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Rank Badge */}
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0",
            isTop3
              ? `bg-gradient-to-br ${rankBadgeColors[rankIdx]} text-white`
              : "bg-muted text-muted-foreground"
          )}
        >
          {isTop3 && neighborhood.rank === 1 ? (
            <Trophy className="w-5 h-5" />
          ) : (
            `#${neighborhood.rank}`
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground truncate">
              {neighborhood.name}
            </h3>
            {isTop3 && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                Top
              </span>
            )}
          </div>
          <p className="text-xl font-bold text-foreground mt-1">
            ${neighborhood.estimated_value?.toLocaleString()}
          </p>

          {/* Stats Row */}
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span>Income: ${(neighborhood.median_income / 1000).toFixed(0)}k</span>
            <span className="w-1 h-1 bg-border rounded-full" />
            <span>{neighborhood.ownership_rate}% owned</span>
            <span className="w-1 h-1 bg-border rounded-full" />
            <span>{neighborhood.avg_home_age}yr avg</span>
          </div>
        </div>

        {/* Trend Badge */}
        <div
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium shrink-0",
            trend.color
          )}
        >
          <TrendIcon className="w-3 h-3" />
          {trend.label}
        </div>
      </div>
    </div>
  );
}