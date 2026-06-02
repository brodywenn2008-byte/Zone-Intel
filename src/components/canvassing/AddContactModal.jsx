import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, UserPlus } from "lucide-react";

const STATUSES = [
  { id: "knocked", label: "Knocked", emoji: "✊" },
  { id: "interested", label: "Interested", emoji: "🙂" },
  { id: "follow_up", label: "Follow Up", emoji: "🔄" },
  { id: "appointment_set", label: "Appt Set", emoji: "📅" },
  { id: "not_interested", label: "Not Interested", emoji: "🚫" },
  { id: "no_answer", label: "No Answer", emoji: "🔇" },
];

export default function AddContactModal({ onClose, onCreated, user }) {
  const [form, setForm] = useState({
    owner_name: "",
    address: "",
    phone: "",
    status: "knocked",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const save = async () => {
    if (!form.address) return;
    setSaving(true);
    // Optimistic: add to list immediately with temp id
    const optimisticLead = {
      ...form,
      id: `temp_${Date.now()}`,
      assigned_rep: user?.email,
      last_contact_date: new Date().toISOString(),
      visit_count: 1,
      created_date: new Date().toISOString(),
    };
    onCreated(optimisticLead);
    // Persist in background
    const lead = await base44.entities.Lead.create({
      ...form,
      assigned_rep: user?.email,
      last_contact_date: new Date().toISOString(),
      visit_count: 1,
    });
    await base44.entities.Visit.create({
      lead_id: lead.id,
      rep_email: user?.email,
      status: form.status,
      notes: form.notes,
    });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full bg-card rounded-t-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-foreground text-base">Log a Contact</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Address - required */}
          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1.5 block">Address *</label>
            <Input
              placeholder="123 Main St, City, ST"
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              className="h-10 text-sm"
            />
          </div>

          {/* Name */}
          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1.5 block">Homeowner Name</label>
            <Input
              placeholder="John Smith"
              value={form.owner_name}
              onChange={(e) => set("owner_name", e.target.value)}
              className="h-10 text-sm"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1.5 block">Phone</label>
            <Input
              placeholder="(555) 000-0000"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              type="tel"
              className="h-10 text-sm"
            />
          </div>

          {/* Status */}
          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1.5 block">Outcome</label>
            <div className="grid grid-cols-3 gap-2">
              {STATUSES.map(({ id, label, emoji }) => (
                <button
                  key={id}
                  onClick={() => set("status", id)}
                  className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 text-xs font-semibold transition-all ${
                    form.status === id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-muted/30 text-muted-foreground"
                  }`}
                >
                  <span className="text-base">{emoji}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1.5 block">Notes</label>
            <textarea
              placeholder="Any notes about this contact..."
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={3}
              className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-background text-foreground resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring placeholder:text-muted-foreground"
            />
          </div>

          <Button onClick={save} disabled={saving || !form.address} className="w-full h-11 font-bold text-sm">
            {saving ? "Saving..." : "Save Contact"}
          </Button>
        </div>
      </div>
    </div>
  );
}