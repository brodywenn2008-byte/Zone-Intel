import { MapPin, Phone, Star, Clock, Navigation } from "lucide-react";
import StatusBadge, { STATUS_CONFIG } from "./StatusBadge";
import { format } from "date-fns";

export default function LeadListItem({ lead, onClick, isSelected, index }) {
  const scoreColor = lead.lead_score >= 70 ? "text-green-600" : lead.lead_score >= 40 ? "text-yellow-600" : "text-red-400";
  const hasFollowUp = lead.follow_up_date && new Date(lead.follow_up_date) > new Date();

  return (
    <div
      onClick={() => onClick(lead)}
      className={`flex items-start gap-3 px-4 py-3.5 border-b border-border cursor-pointer transition-all active:bg-muted/80 ${
        isSelected ? "bg-primary/5 border-l-4 border-l-primary" : "hover:bg-muted/40"
      }`}
    >
      {index != null && (
        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-xs font-bold text-muted-foreground">{index + 1}</span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 mb-0.5">
          <p className="text-sm font-semibold text-foreground truncate flex-1 leading-snug">
            {lead.owner_name || "Unknown Owner"}
          </p>
          {lead.lead_score != null && (
            <span className={`text-xs font-bold flex items-center gap-0.5 flex-shrink-0 ${scoreColor}`}>
              <Star className="w-3 h-3" />{lead.lead_score}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1.5 truncate">
          <MapPin className="w-3 h-3 flex-shrink-0" />{lead.address}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={lead.status} size="sm" />
          {lead.ai_priority === "high" && (
            <span className="text-xs font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full">🔥 High</span>
          )}
          {lead.phone && (
            <span className="text-xs text-muted-foreground flex items-center gap-0.5">
              <Phone className="w-3 h-3" />{lead.phone}
            </span>
          )}
          {hasFollowUp && (
            <span className="text-xs text-amber-600 font-semibold flex items-center gap-0.5">
              <Clock className="w-3 h-3" />{format(new Date(lead.follow_up_date), "MMM d")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}