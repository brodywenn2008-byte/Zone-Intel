import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { X, Phone, MapPin, User, Calendar, Star, Tag, Clock, Home, Navigation, Plus } from "lucide-react";
import StatusBadge, { STATUS_CONFIG } from "./StatusBadge";
import { format } from "date-fns";

const QUICK_STATUSES = ["knocked", "interested", "no_answer", "not_interested", "follow_up", "appointment_set", "sold"];

export default function LeadDetailSheet({ lead, onClose, onUpdate, userPosition, onScheduleAppt }) {
  const [notes, setNotes] = useState(lead?.notes || "");
  const [saving, setSaving] = useState(false);
  const [followUpDate, setFollowUpDate] = useState(lead?.follow_up_date?.slice(0, 16) || "");
  const [showAllStatuses, setShowAllStatuses] = useState(false);

  const updateStatus = async (status) => {
    setSaving(true);
    const updates = {
      status,
      notes,
      last_contact_date: new Date().toISOString(),
      visit_count: (lead.visit_count || 0) + 1,
      follow_up_date: followUpDate || lead.follow_up_date,
    };
    // Optimistic update immediately
    onUpdate({ ...lead, ...updates }, false);
    const updated = await base44.entities.Lead.update(lead.id, updates);
    await base44.entities.Visit.create({
      lead_id: lead.id,
      status,
      notes,
      lat: userPosition?.[0],
      lng: userPosition?.[1],
    });
    setSaving(false);
    onUpdate(updated, false);
  };

  const saveNotes = async () => {
    setSaving(true);
    // Optimistic update immediately
    onUpdate({ ...lead, notes, follow_up_date: followUpDate || lead.follow_up_date }, false);
    const updated = await base44.entities.Lead.update(lead.id, {
      notes,
      follow_up_date: followUpDate || undefined,
    });
    setSaving(false);
    onUpdate(updated, false);
  };

  if (!lead) return null;

  const scoreColor = lead.lead_score >= 70 ? "text-green-600" : lead.lead_score >= 40 ? "text-yellow-600" : "text-red-500";
  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(lead.address)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
      <div
        className="relative w-full max-w-lg mx-auto bg-card rounded-t-3xl shadow-2xl max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-border rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 pt-2 pb-4 border-b border-border">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <p className="font-bold text-foreground text-lg leading-tight truncate">
                {lead.owner_name || "Unknown Owner"}
              </p>
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                className="text-sm text-primary flex items-center gap-1 mt-1 hover:underline">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{lead.address}</span>
              </a>
            </div>
            <div className="flex items-center gap-2">
              {lead.address && (
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center hover:bg-primary/20">
                  <Navigation className="w-4 h-4 text-primary" />
                </a>
              )}
              <button onClick={onClose} className="w-9 h-9 rounded-xl hover:bg-muted flex items-center justify-center">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={lead.status} size="md" />
            {lead.lead_score != null && (
              <span className={`text-xs font-bold flex items-center gap-1 ${scoreColor}`}>
                <Star className="w-3 h-3" />Score {lead.lead_score}/100
              </span>
            )}
            {lead.ai_priority && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                lead.ai_priority === "high" ? "bg-red-100 text-red-700" :
                lead.ai_priority === "medium" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
              }`}>
                AI: {lead.ai_priority}
              </span>
            )}
          </div>
        </div>

        {/* Info grid */}
        <div className="px-5 py-4 grid grid-cols-2 gap-3 border-b border-border">
          {lead.phone && (
            <a href={`tel:${lead.phone}`}
              className="flex items-center gap-2.5 p-3 bg-primary rounded-xl text-white col-span-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-white/70">Tap to Call</p>
                <p className="text-sm font-bold">{lead.phone}</p>
              </div>
            </a>
          )}

          {lead.home_value && (
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-xl">
              <Home className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Est. Value</p>
                <p className="text-sm font-bold text-foreground">${(lead.home_value / 1000).toFixed(0)}k</p>
              </div>
            </div>
          )}

          {lead.is_homeowner != null && (
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-xl">
              <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="text-sm font-bold text-foreground">{lead.is_homeowner ? "Homeowner" : "Renter"}</p>
              </div>
            </div>
          )}

          {lead.visit_count > 0 && (
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-xl">
              <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Visits</p>
                <p className="text-sm font-bold text-foreground">{lead.visit_count}x
                  {lead.last_contact_date && <span className="font-normal text-muted-foreground"> · {format(new Date(lead.last_contact_date), "MMM d")}</span>}
                </p>
              </div>
            </div>
          )}

          {lead.follow_up_date && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl">
              <Calendar className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <div>
                <p className="text-xs text-amber-600 font-medium">Follow-up</p>
                <p className="text-sm font-bold text-amber-700">{format(new Date(lead.follow_up_date), "MMM d, h:mma")}</p>
              </div>
            </div>
          )}

          {lead.tags?.length > 0 && (
            <div className="col-span-2 flex items-center gap-1.5 flex-wrap">
              <Tag className="w-3.5 h-3.5 text-muted-foreground" />
              {lead.tags.map(t => (
                <span key={t} className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full font-medium">{t}</span>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="px-5 py-4 border-b border-border">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Visit Notes</p>
          <Textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Add notes about this visit, objections, interest level..."
            rows={3}
            className="text-sm resize-none"
          />
          <div className="mt-2.5">
            <label className="text-xs font-semibold text-muted-foreground">Follow-up Date & Time</label>
            <input
              type="datetime-local"
              value={followUpDate}
              onChange={e => setFollowUpDate(e.target.value)}
              className="mt-1.5 w-full text-sm border border-border rounded-xl px-3 py-2 bg-background text-foreground"
            />
          </div>
          <Button onClick={saveNotes} disabled={saving} variant="outline" size="sm" className="mt-2.5 w-full h-9 text-xs">
            {saving ? "Saving..." : "Save Notes & Follow-up"}
          </Button>
        </div>

        {/* Schedule Appointment Button */}
        {onScheduleAppt && (
          <div className="px-5 py-3 border-b border-border">
            <button onClick={onScheduleAppt}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-purple-200 bg-purple-50 text-purple-700 font-bold text-sm hover:bg-purple-100 active:scale-95 transition-all">
              <Calendar className="w-4 h-4" />
              Schedule Appointment
            </button>
          </div>
        )}

        {/* Status Actions */}
        <div className="px-5 py-4 pb-6">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Log Visit Outcome</p>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_STATUSES.map(status => {
              const cfg = STATUS_CONFIG[status];
              const isActive = lead.status === status;
              return (
                <button
                  key={status}
                  onClick={() => updateStatus(status)}
                  disabled={saving}
                  className={`flex items-center gap-2.5 px-3 py-3 rounded-xl text-sm font-semibold border-2 transition-all active:scale-95 ${
                    isActive
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card hover:bg-muted"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                  <span className="truncate">{cfg.label}</span>
                  {isActive && <span className="ml-auto text-primary text-xs">✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}