import { STATUS_CONFIG } from "./StatusBadge";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function MapLegend({ leads }) {
  const [expanded, setExpanded] = useState(false);

  const counts = {};
  leads.forEach(l => { counts[l.status] = (counts[l.status] || 0) + 1; });

  return (
    <div className="bg-card/95 backdrop-blur-sm rounded-2xl shadow-lg border border-border overflow-hidden">
      <button
        className="flex items-center gap-2 px-3 py-2 w-full"
        onClick={() => setExpanded(!expanded)}
      >
        <p className="text-xs font-bold text-foreground flex-1 text-left">Legend</p>
        {expanded ? <ChevronDown className="w-3 h-3 text-muted-foreground" /> : <ChevronUp className="w-3 h-3 text-muted-foreground" />}
      </button>
      {expanded && (
        <div className="px-3 pb-2.5 grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-border pt-2">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: cfg.mapColor }} />
              <span className="text-xs text-foreground flex-1 truncate">{cfg.label}</span>
              {counts[key] != null && <span className="text-xs font-bold text-muted-foreground">{counts[key]}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}