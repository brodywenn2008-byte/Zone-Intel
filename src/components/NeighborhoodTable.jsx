import { useState } from "react";
import { SERVICES } from "./FilterPanel";

const SERVICE_MAP = Object.fromEntries(SERVICES.map(s => [s.value, s]));
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

const TREND_STYLES = {
  rising: { label: "↑ Rising", color: "#16a34a", bg: "#f0fdf4" },
  stable: { label: "→ Stable", color: "#d97706", bg: "#fffbeb" },
  declining: { label: "↓ Declining", color: "#dc2626", bg: "#fef2f2" },
};

function SortIcon({ field, sortField, sortDir }) {
  if (sortField !== field) return <ArrowUpDown className="w-3 h-3 opacity-40" />;
  return sortDir === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />;
}

export default function NeighborhoodTable({ neighborhoods }) {
  const [sortField, setSortField] = useState("estimated_value");
  const [sortDir, setSortDir] = useState("desc");

  const handleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("desc"); }
  };

  const sorted = [...neighborhoods].sort((a, b) => {
    let av, bv;
    if (sortField === "sales_potential") {
      av = calcSalesPotential(a);
      bv = calcSalesPotential(b);
    } else {
      av = a[sortField] ?? 0;
      bv = b[sortField] ?? 0;
    }
    if (typeof av === "string") return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    return sortDir === "asc" ? av - bv : bv - av;
  });

  const formatValue = (v) => {
    if (!v) return "—";
    if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
    return `$${(v / 1000).toFixed(0)}k`;
  };

  const calcSalesPotential = (n) => {
    const rankScore = 100 - (n.rank - 1) * 12;
    const trendScore = { rising: 100, stable: 70, declining: 40 }[n.market_trend] || 50;
    const ownershipScore = n.ownership_rate || 50;
    return Math.round((rankScore + trendScore + ownershipScore) / 3);
  };

  const cols = [
    { key: "name", label: "Area", sortable: false },
    { key: "sales_potential", label: "Sales Potential", sortable: true },
    { key: "market_trend", label: "Trend", sortable: true },
    { key: "market_trend", label: "Target?", sortable: false, buyCol: true },
    { key: "popular_services", label: "Hot Services", sortable: false, servicesCol: true },
  ];

  if (neighborhoods.length === 0) return null;

  return (
    <div className="px-5 mb-6">
      <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
        Territory Overview
      </h2>
      <div className="rounded-lg border border-border overflow-hidden bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {cols.map((col) => (
                  <th
                    key={col.key}
                    className={`px-2 py-1.5 text-left text-xs font-semibold text-muted-foreground ${col.sortable ? "cursor-pointer hover:text-foreground select-none" : ""}`}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      {col.sortable && <SortIcon field={col.key} sortField={sortField} sortDir={sortDir} />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((n, i) => {
                const trend = TREND_STYLES[n.market_trend] || { label: n.market_trend, color: "#64748b", bg: "#f8fafc" };
                return (
                  <tr key={n.name} className={`border-b border-border last:border-0 ${i % 2 === 0 ? "" : "bg-muted/20"}`}>
                    <td className="px-2 py-1 font-medium text-foreground text-xs">{n.name}</td>
                    <td className="px-2 py-1 font-bold text-foreground text-xs">
                      <div className="flex items-center gap-1">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-accent" style={{ width: `${calcSalesPotential(n)}%` }}></div>
                        </div>
                        <span className="text-xs font-bold text-accent w-8 text-right">{calcSalesPotential(n)}%</span>
                      </div>
                    </td>
                    <td className="px-2 py-1">
                      <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full" style={{ color: trend.color, backgroundColor: trend.bg }}>
                        {trend.label}
                      </span>
                    </td>
                    <td className="px-2 py-1">
                      {(() => {
                        const cfg = { rising: { label: "✓ Yes", color: "#16a34a", bg: "#f0fdf4" }, stable: { label: "~ Maybe", color: "#d97706", bg: "#fffbeb" }, declining: { label: "✗ No", color: "#dc2626", bg: "#fef2f2" } }[n.market_trend] || { label: "—", color: "#64748b", bg: "#f8fafc" };
                        return <span className="text-xs font-bold px-1.5 py-0.5 rounded-full" style={{ color: cfg.color, backgroundColor: cfg.bg }}>{cfg.label}</span>;
                      })()}
                    </td>
                    <td className="px-2 py-1">
                      <div className="flex flex-wrap gap-0.5">
                        {(n.popular_services || []).map(s => {
                          const svc = SERVICE_MAP[s];
                          return svc ? (
                            <span key={s} className="text-xs font-semibold px-1 py-0.5 rounded" style={{ color: svc.color, backgroundColor: svc.bg }}>{svc.label}</span>
                          ) : null;
                        })}
                        {(!n.popular_services || n.popular_services.length === 0) && <span className="text-xs text-muted-foreground">—</span>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}