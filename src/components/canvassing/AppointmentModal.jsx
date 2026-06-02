import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Calendar, MapPin } from "lucide-react";

export default function AppointmentModal({ lead, onClose, onCreated }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!date) return;
    setSaving(true);
    const dt = new Date(`${date}T${time}`);
    const appt = await base44.entities.Appointment.create({
      lead_id: lead.id,
      address: lead.address,
      owner_name: lead.owner_name,
      date: dt.toISOString(),
      notes,
      status: "scheduled",
    });
    await base44.entities.Lead.update(lead.id, {
      status: "appointment_set",
      appointment_date: dt.toISOString(),
    });
    setSaving(false);
    onCreated(appt);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative w-full max-w-lg mx-auto bg-card rounded-t-3xl shadow-2xl px-5 pb-8 pt-5"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-foreground">Schedule Appointment</h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" />{lead.address}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().slice(0, 10)}
                className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-background text-foreground" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Time</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)}
                className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-background text-foreground" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Notes</label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="What was discussed, products of interest..." rows={3}
              className="text-sm resize-none" />
          </div>
          <Button onClick={save} disabled={saving || !date} className="w-full h-11 text-sm font-bold">
            <Calendar className="w-4 h-4 mr-2" />
            {saving ? "Scheduling..." : "Schedule Appointment"}
          </Button>
        </div>
      </div>
    </div>
  );
}