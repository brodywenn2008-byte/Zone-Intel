import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Plus, Loader2, Trash2, ChevronRight, Home, CheckCircle2 } from "lucide-react";

const TERRITORY_COLORS = ["#3b82f6", "#22c55e", "#f97316", "#a855f7", "#ec4899", "#14b8a6", "#f59e0b", "#6366f1"];

export default function TerritorySelector({ territories, selectedId, onSelect, onCreated, onDeleted }) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [loading, setLoading] = useState(false);

  const createTerritory = async () => {
    if (!name) return;
    setLoading(true);
    const color = TERRITORY_COLORS[territories.length % TERRITORY_COLORS.length];
    const territory = await base44.entities.Territory.create({
      name,
      city: city || zip,
      zip_code: zip,
      color,
      status: "active",
    });
    setLoading(false);
    setCreating(false);
    setName(""); setCity(""); setZip("");
    onCreated(territory);
  };

  const deleteTerritory = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Delete this territory? Leads will remain.")) return;
    await base44.entities.Territory.delete(id);
    onDeleted(id);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="font-bold text-foreground text-base">Territories</h2>
          <p className="text-xs text-muted-foreground">{territories.length} area{territories.length !== 1 ? "s" : ""}</p>
        </div>
        <Button size="sm" onClick={() => setCreating(true)} className="h-8 px-3 text-xs gap-1">
          <Plus className="w-3 h-3" />New
        </Button>
      </div>

      {creating && (
        <div className="px-4 py-3 border-b border-border bg-muted/30 space-y-2">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">New Territory</p>
          <Input placeholder="Territory name (e.g. North Side)" value={name} onChange={e => setName(e.target.value)} className="h-9 text-sm" />
          <Input placeholder="City, State (e.g. Austin, TX)" value={city} onChange={e => setCity(e.target.value)} className="h-9 text-sm" />
          <Input placeholder="ZIP code (optional)" value={zip} onChange={e => setZip(e.target.value)} className="h-9 text-sm" />
          <div className="flex gap-2">
            <Button size="sm" onClick={createTerritory} disabled={loading || !name} className="flex-1 h-9 text-xs">
              {loading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
              Create Territory
            </Button>
            <Button size="sm" variant="outline" onClick={() => setCreating(false)} className="h-9 text-xs px-3">Cancel</Button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {territories.length === 0 && !creating && (
          <div className="flex flex-col items-center justify-center h-40 text-center px-6">
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
              <MapPin className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">No territories yet</p>
            <p className="text-xs text-muted-foreground">Create one to start canvassing.</p>
          </div>
        )}
        {territories.map(t => {
          const isSelected = selectedId === t.id;
          return (
            <div
              key={t.id}
              onClick={() => onSelect(t)}
              className={`flex items-center gap-3 px-4 py-3.5 border-b border-border cursor-pointer transition-colors ${
                isSelected ? "bg-primary/5" : "hover:bg-muted/40 active:bg-muted/70"
              }`}
            >
              <div className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ background: t.color || "#3b82f6" }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm text-foreground truncate">{t.name}</p>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                </div>
                <p className="text-xs text-muted-foreground">{t.city || t.zip_code || "No location"}</p>
                {t.total_homes > 0 && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Home className="w-3 h-3" />
                    {t.homes_visited}/{t.total_homes} visited
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={e => deleteTerritory(e, t.id)}
                  className="p-1.5 hover:text-destructive text-muted-foreground rounded-lg hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}