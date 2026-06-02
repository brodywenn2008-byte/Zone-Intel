import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Navigation, Loader2, RotateCcw, Play, CheckCircle2, MapPin } from "lucide-react";
import StatusBadge from "./StatusBadge";

// Simple nearest-neighbor TSP heuristic for route optimization
function optimizeRoute(leads) {
  if (leads.length <= 2) return leads;
  const unvisited = [...leads];
  const route = [unvisited.splice(0, 1)[0]];
  while (unvisited.length > 0) {
    const last = route[route.length - 1];
    let closest = 0, minDist = Infinity;
    unvisited.forEach((l, i) => {
      const dist = Math.pow(l.lat - last.lat, 2) + Math.pow(l.lng - last.lng, 2);
      if (dist < minDist) { minDist = dist; closest = i; }
    });
    route.push(unvisited.splice(closest, 1)[0]);
  }
  return route;
}

export default function RouteOptimizer({ leads, territory, user, onRouteChange, onLeadSelect }) {
  const [route, setRoute] = useState([]);
  const [currentStop, setCurrentStop] = useState(0);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const eligibleLeads = leads.filter(l =>
    l.lat && l.lng && (l.status === "not_visited" || l.status === "no_answer" || l.status === "follow_up")
  );

  const buildRoute = async () => {
    setIsOptimizing(true);
    const optimized = optimizeRoute(eligibleLeads);
    setRoute(optimized);
    setCurrentStop(0);
    setIsActive(true);
    onRouteChange(optimized);

    // Save route to DB
    if (territory && user) {
      await base44.entities.Route.create({
        name: `${territory.name} - ${new Date().toLocaleDateString()}`,
        territory_id: territory.id,
        rep_email: user.email,
        lead_ids: optimized.map(l => l.id),
        total_stops: optimized.length,
        completed_stops: 0,
        date: new Date().toISOString().slice(0, 10),
        status: "active",
      });
    }
    setIsOptimizing(false);
  };

  const clearRoute = () => {
    setRoute([]);
    setCurrentStop(0);
    setIsActive(false);
    onRouteChange([]);
  };

  const navigateTo = (lead) => {
    const url = `https://maps.google.com/?q=${encodeURIComponent(lead.address)}&travelmode=walking`;
    window.open(url, "_blank");
  };

  if (!isActive) {
    return (
      <div className="px-4 py-3 bg-card border-b border-border">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <p className="text-xs font-semibold text-foreground">{eligibleLeads.length} stops available</p>
            <p className="text-xs text-muted-foreground">Not visited + follow-ups</p>
          </div>
          <Button
            onClick={buildRoute}
            disabled={isOptimizing || eligibleLeads.length === 0}
            size="sm"
            className="h-9 px-4 text-xs gap-1.5"
          >
            {isOptimizing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
            Optimize Route
          </Button>
        </div>
      </div>
    );
  }

  const current = route[currentStop];
  const completed = currentStop;
  const remaining = route.length - currentStop;

  return (
    <div className="bg-card border-b border-border">
      {/* Route header */}
      <div className="px-4 py-2.5 flex items-center gap-2 border-b border-border bg-purple-50">
        <Navigation className="w-4 h-4 text-purple-600" />
        <p className="text-xs font-bold text-purple-700 flex-1">
          Route Active · Stop {currentStop + 1} of {route.length}
        </p>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-purple-600 font-medium">{remaining} left</span>
          <button onClick={clearRoute} className="p-1 hover:bg-purple-100 rounded text-purple-600">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-muted">
        <div className="h-full bg-purple-500 transition-all" style={{ width: `${(completed / route.length) * 100}%` }} />
      </div>

      {/* Current stop */}
      {current && (
        <div className="px-4 py-3 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0 text-white text-xs font-black">
            {currentStop + 1}
          </div>
          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onLeadSelect(current)}>
            <p className="text-sm font-bold text-foreground truncate">{current.owner_name || "Unknown"}</p>
            <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
              <MapPin className="w-3 h-3" />{current.address}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <StatusBadge status={current.status} size="sm" />
              {current.lead_score != null && (
                <span className="text-xs text-muted-foreground">Score: {current.lead_score}</span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <button onClick={() => navigateTo(current)}
              className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold flex items-center gap-1">
              <Navigation className="w-3 h-3" />Go
            </button>
            {currentStop < route.length - 1 && (
              <button onClick={() => setCurrentStop(c => c + 1)}
                className="px-3 py-1.5 bg-muted text-foreground rounded-lg text-xs font-bold">
                Next →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Upcoming stops preview */}
      {route.slice(currentStop + 1, currentStop + 3).length > 0 && (
        <div className="px-4 pb-3 flex gap-2">
          {route.slice(currentStop + 1, currentStop + 3).map((l, i) => (
            <div key={l.id} className="flex items-center gap-1.5 bg-muted/60 rounded-lg px-2.5 py-1.5 flex-1 min-w-0"
              onClick={() => onLeadSelect(l)}>
              <span className="text-xs font-bold text-muted-foreground w-4">{currentStop + i + 2}</span>
              <p className="text-xs text-foreground truncate">{l.owner_name || l.address}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}