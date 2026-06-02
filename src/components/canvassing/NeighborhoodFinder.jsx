import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2, Sparkles, ChevronDown, ChevronUp, Star, Users, Home, TrendingUp } from "lucide-react";

const CATEGORY_COLORS = {
  homeowners: "bg-blue-50 text-blue-700 border-blue-200",
  seniors: "bg-purple-50 text-purple-700 border-purple-200",
  families: "bg-green-50 text-green-700 border-green-200",
  high_income: "bg-amber-50 text-amber-700 border-amber-200",
  new_construction: "bg-cyan-50 text-cyan-700 border-cyan-200",
  renters: "bg-slate-100 text-slate-600 border-slate-200",
};

function ScoreBar({ score }) {
  const pct = Math.round((score / 10) * 100);
  const color = score >= 8 ? "bg-green-500" : score >= 6 ? "bg-amber-400" : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-bold text-foreground w-6 text-right">{score}</span>
    </div>
  );
}

export default function NeighborhoodFinder() {
  const [city, setCity] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  const findNeighborhoods = async () => {
    if (!city) return;
    setIsLoading(true);
    setNeighborhoods([]);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert field sales strategist. For the city/area "${city}", identify the 10 BEST neighborhoods for door-to-door insurance/home services canvassing.

For each neighborhood provide:
- Neighborhood name
- Overall canvassing score (1-10)
- Primary prospect type: one of "homeowners", "seniors", "families", "high_income", "new_construction", "renters"
- Why it's good for canvassing (2-3 sentences)
- Best days/times to canvass
- What insurance products are best fits (auto, home, life, health, commercial)
- 2-3 specific canvassing tips for that neighborhood
- Estimated homes (rough number)
- Average home value range

Rank them from best to worst canvassing opportunity. Be specific and realistic about real neighborhoods in that area.`,
      add_context_from_internet: true,
      model: "gemini_3_flash",
      response_json_schema: {
        type: "object",
        properties: {
          city_summary: { type: "string" },
          neighborhoods: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                score: { type: "number" },
                primary_type: { type: "string" },
                why_good: { type: "string" },
                best_time: { type: "string" },
                best_products: { type: "array", items: { type: "string" } },
                tips: { type: "array", items: { type: "string" } },
                estimated_homes: { type: "number" },
                home_value_range: { type: "string" },
              },
            },
          },
        },
      },
    });
    setNeighborhoods(res?.neighborhoods || []);
    setIsLoading(false);
  };

  const typeColor = (t) => CATEGORY_COLORS[t] || "bg-slate-100 text-slate-600 border-slate-200";
  const typeLabel = (t) => ({
    homeowners: "Homeowners",
    seniors: "Seniors",
    families: "Families",
    high_income: "High Income",
    new_construction: "New Construction",
    renters: "Renters",
  }[t] || t);

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Search */}
      <div className="px-4 pt-4 pb-3 bg-card border-b border-border">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Enter city or area (e.g. Austin TX)"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && findNeighborhoods()}
              className="pl-10 h-10 text-sm"
            />
          </div>
          <Button onClick={findNeighborhoods} disabled={isLoading || !city} className="h-10 px-4 gap-1.5">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {isLoading ? "Finding..." : "Find"}
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground font-medium">Analyzing neighborhoods in {city}...</p>
        </div>
      )}

      {!isLoading && neighborhoods.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Home className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-bold text-foreground text-base mb-2">Find Your Best Neighborhoods</h3>
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
            Enter a city to get AI-ranked neighborhoods with canvassing scores, best times, and product recommendations.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {["Detroit MI", "Austin TX", "Phoenix AZ", "Atlanta GA"].map((s) => (
              <button key={s} onClick={() => setCity(s)}
                className="text-xs font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors">
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {neighborhoods.length > 0 && !isLoading && (
        <div className="p-4 space-y-3">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {neighborhoods.length} neighborhoods — {city}
          </p>
          {neighborhoods.map((n, i) => {
            const isOpen = expandedId === i;
            return (
              <div key={i} className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                <button
                  className="w-full text-left p-4 flex items-start gap-3"
                  onClick={() => setExpandedId(isOpen ? null : i)}
                >
                  {/* Rank badge */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-black text-sm ${
                    i === 0 ? "bg-amber-100 text-amber-700" : i <= 2 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  }`}>
                    {i === 0 ? "⭐" : `#${i + 1}`}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-foreground text-sm">{n.name}</p>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${typeColor(n.primary_type)}`}>
                        {typeLabel(n.primary_type)}
                      </span>
                    </div>
                    <ScoreBar score={n.score} />
                    {n.home_value_range && (
                      <p className="text-xs text-muted-foreground mt-1">{n.home_value_range}</p>
                    )}
                  </div>

                  {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />}
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                    {n.why_good && (
                      <p className="text-xs text-foreground leading-relaxed">{n.why_good}</p>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      {n.best_time && (
                        <div className="bg-muted/50 rounded-lg p-2.5">
                          <p className="text-xs font-bold text-muted-foreground mb-1">Best Time</p>
                          <p className="text-xs text-foreground">{n.best_time}</p>
                        </div>
                      )}
                      {n.estimated_homes && (
                        <div className="bg-muted/50 rounded-lg p-2.5">
                          <p className="text-xs font-bold text-muted-foreground mb-1">Est. Homes</p>
                          <p className="text-xs text-foreground font-bold">{n.estimated_homes?.toLocaleString()}</p>
                        </div>
                      )}
                    </div>

                    {n.best_products?.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-muted-foreground mb-1.5">Best Products</p>
                        <div className="flex flex-wrap gap-1.5">
                          {n.best_products.map((p, pi) => (
                            <span key={pi} className="text-xs font-semibold bg-primary/10 text-primary px-2 py-1 rounded-full">{p}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {n.tips?.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-muted-foreground mb-1.5">Canvassing Tips</p>
                        <div className="space-y-1">
                          {n.tips.map((tip, ti) => (
                            <p key={ti} className="text-xs text-foreground flex gap-2">
                              <span className="text-primary font-bold flex-shrink-0">→</span> {tip}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}