import { cn } from "@/lib/utils";

export const STATUS_CONFIG = {
  not_visited:      { label: "Not Visited",     color: "bg-slate-100 text-slate-600",    dot: "bg-slate-400",    mapColor: "#94a3b8", emoji: "⬜" },
  knocked:          { label: "Knocked",          color: "bg-blue-100 text-blue-700",      dot: "bg-blue-500",     mapColor: "#3b82f6", emoji: "🚪" },
  interested:       { label: "Interested",       color: "bg-yellow-100 text-yellow-700",  dot: "bg-yellow-500",   mapColor: "#eab308", emoji: "⭐" },
  follow_up:        { label: "Follow Up",        color: "bg-orange-100 text-orange-700",  dot: "bg-orange-500",   mapColor: "#f97316", emoji: "🔁" },
  appointment_set:  { label: "Appt Set",         color: "bg-purple-100 text-purple-700",  dot: "bg-purple-500",   mapColor: "#a855f7", emoji: "📅" },
  sold:             { label: "Sold!",            color: "bg-green-100 text-green-700",    dot: "bg-green-500",    mapColor: "#22c55e", emoji: "✅" },
  no_answer:        { label: "No Answer",        color: "bg-gray-100 text-gray-600",      dot: "bg-gray-400",     mapColor: "#9ca3af", emoji: "🔕" },
  not_interested:   { label: "Not Interested",   color: "bg-red-100 text-red-600",        dot: "bg-red-400",      mapColor: "#ef4444", emoji: "❌" },
};

export default function StatusBadge({ status, size = "sm" }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.not_visited;
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full font-semibold",
      cfg.color,
      size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
    )}>
      <span className={cn("rounded-full flex-shrink-0", cfg.dot, size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2")} />
      {cfg.label}
    </span>
  );
}