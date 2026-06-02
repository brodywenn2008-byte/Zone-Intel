import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Calendar, MapPin, Phone, Check, X, Clock, Navigation, Plus } from "lucide-react";
import { format, isToday, isTomorrow, isPast, isThisWeek } from "date-fns";
import { Button } from "@/components/ui/button";
import StatusBadge from "./StatusBadge";

const STATUS_STYLES = {
  scheduled: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  no_show: "bg-gray-100 text-gray-600",
};

const getDateLabel = (dateStr) => {
  const d = new Date(dateStr);
  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  if (isThisWeek(d)) return format(d, "EEEE");
  return format(d, "EEE, MMM d");
};

export default function AppointmentsList({ appointments, leads, onUpdate }) {
  const [updating, setUpdating] = useState(null);

  const updateStatus = async (appt, status) => {
    setUpdating(appt.id);
    const updated = await base44.entities.Appointment.update(appt.id, { status });
    setUpdating(null);
    onUpdate(updated);
  };

  const sorted = [...appointments].sort((a, b) => new Date(a.date) - new Date(b.date));
  const upcoming = sorted.filter(a => a.status === "scheduled" && !isPast(new Date(a.date)));
  const overdue = sorted.filter(a => a.status === "scheduled" && isPast(new Date(a.date)));
  const past = sorted.filter(a => a.status !== "scheduled");

  const renderAppt = (appt, isOverdue = false) => {
    const lead = leads.find(l => l.id === appt.lead_id);
    const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(appt.address || lead?.address || "")}`;
    return (
      <div key={appt.id} className={`bg-card border rounded-2xl p-4 ${isOverdue ? "border-orange-300 bg-orange-50" : "border-border"}`}>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <p className="font-bold text-foreground truncate">{appt.owner_name || lead?.owner_name || "Unknown"}</p>
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs text-primary flex items-center gap-1 mt-0.5 hover:underline">
              <MapPin className="w-3 h-3" />{appt.address || lead?.address || "No address"}
            </a>
          </div>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${isOverdue ? "bg-orange-100 text-orange-700" : STATUS_STYLES[appt.status]}`}>
            {isOverdue ? "⚠️ Overdue" : appt.status}
          </span>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-1.5 text-sm font-bold text-primary">
            <Clock className="w-4 h-4" />
            <span>{getDateLabel(appt.date)} · {format(new Date(appt.date), "h:mm a")}</span>
          </div>
        </div>

        {lead?.phone && (
          <a href={`tel:${lead.phone}`}
            className="flex items-center gap-2 mb-3 text-sm text-primary font-medium">
            <Phone className="w-4 h-4" />{lead.phone}
          </a>
        )}

        {appt.notes && (
          <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 mb-3 italic">"{appt.notes}"</p>
        )}

        <div className="flex gap-2">
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-background text-xs font-bold text-foreground hover:bg-muted flex-shrink-0">
            <Navigation className="w-3 h-3" />Nav
          </a>
          {appt.status === "scheduled" && (
            <>
              <Button size="sm" onClick={() => updateStatus(appt, "completed")} disabled={updating === appt.id}
                className="flex-1 h-9 text-xs bg-green-600 hover:bg-green-700">
                <Check className="w-3 h-3 mr-1" />Completed
              </Button>
              <Button size="sm" variant="outline" onClick={() => updateStatus(appt, "no_show")} disabled={updating === appt.id}
                className="h-9 text-xs px-3">No Show</Button>
              <button onClick={() => updateStatus(appt, "cancelled")} disabled={updating === appt.id}
                className="p-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50">
                <X className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="overflow-y-auto pb-24 bg-background">
      {appointments.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-center px-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8 text-primary" />
          </div>
          <p className="font-bold text-foreground mb-1">No appointments yet</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            When you set a lead to "Appointment Set" status, schedule an appointment from the lead detail screen.
          </p>
        </div>
      )}

      <div className="p-4 space-y-6">
        {overdue.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">⚠️ Overdue</span>
              <span className="text-xs bg-orange-100 text-orange-600 font-bold px-2 py-0.5 rounded-full">{overdue.length}</span>
            </div>
            <div className="space-y-3">{overdue.map(a => renderAppt(a, true))}</div>
          </div>
        )}

        {upcoming.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Upcoming</span>
              <span className="text-xs bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">{upcoming.length}</span>
            </div>
            <div className="space-y-3">{upcoming.map(a => renderAppt(a, false))}</div>
          </div>
        )}

        {past.length > 0 && (
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Past</p>
            <div className="space-y-3">{past.slice(0, 10).map(a => renderAppt(a, false))}</div>
          </div>
        )}
      </div>
    </div>
  );
}