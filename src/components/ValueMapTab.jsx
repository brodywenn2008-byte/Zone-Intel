import { useState } from "react";
import { MapPin, Loader2, Search, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, Star, Phone, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const TREND_ICON = {
  rising: <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />,
  stable: <Minus className="w-3.5 h-3.5 text-amber-500" />,
  declining: <TrendingDown className="w-3.5 h-3.5 text-red-400" />,
};

const TREND_LABEL = {
  rising: "Rising",
  stable: "Stable",
  declining: "Declining",
};

const SCORE_COLOR = (score) => {
  if (score >= 80) return "text-emerald-600 bg-emerald-50 border-emerald-200";
  if (score >= 60) return "text-amber-600 bg-amber-50 border-amber-200";
  return "text-red-500 bg-red-50 border-red-200";
};

function NeighborhoodCard({ n, rank }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      <button
        className="w-full text-left p-4"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-black text-primary">#{rank}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-foreground text-sm leading-tight">{n.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{n.zip_code && `ZIP ${n.zip_code} · `}{n.area_type}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`text-sm font-black px-2.5 py-1 rounded-xl border ${SCORE_COLOR(n.canvassing_score)}`}>
              {n.canvassing_score}
            </span>
            {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </div>
        </div>

        {/* Best for tags */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {(n.best_for || []).map((tag, i) => (
            <span key={i} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
              {tag}
            </span>
          ))}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border px-4 py-4 space-y-4">
          {/* Key stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center bg-muted/40 rounded-xl py-2.5">
              <p className="text-sm font-black text-foreground">{n.ownership_rate}%</p>
              <p className="text-xs text-muted-foreground">Owners</p>
            </div>
            <div className="text-center bg-muted/40 rounded-xl py-2.5">
              <p className="text-sm font-black text-foreground">${(n.median_income / 1000).toFixed(0)}k</p>
              <p className="text-xs text-muted-foreground">Avg Income</p>
            </div>
            <div className="text-center bg-muted/40 rounded-xl py-2.5 flex flex-col items-center justify-center">
              {TREND_ICON[n.market_trend]}
              <p className="text-xs text-muted-foreground mt-0.5">{TREND_LABEL[n.market_trend]}</p>
            </div>
          </div>

          {/* Why good */}
          {n.why_good && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
              <p className="text-xs font-bold text-emerald-700 mb-1">✅ Why it's good</p>
              <p className="text-xs text-emerald-800 leading-relaxed">{n.why_good}</p>
            </div>
          )}

          {/* Watch out */}
          {n.watch_out && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-xs font-bold text-amber-700 mb-1">⚠️ Watch out</p>
              <p className="text-xs text-amber-800 leading-relaxed">{n.watch_out}</p>
            </div>
          )}

          {/* Best times */}
          {n.best_times && (
            <div className="flex items-center gap-2">
              <Star className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <p className="text-xs text-foreground"><span className="font-semibold">Best times:</span> {n.best_times}</p>
            </div>
          )}

          {/* Product focus */}
          {n.product_focus && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1.5">Top Products to Pitch</p>
              <div className="flex flex-wrap gap-1.5">
                {(n.product_focus || []).map((p, i) => (
                  <span key={i} className="text-xs px-2 py-1 rounded-lg bg-muted text-foreground font-medium">{p}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ValueMapTab() {
  const [query, setQuery] = useState("");
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [cityName, setCityName] = useState("");

  const search = async () => {
    const q = query.trim();
    if (q.length < 2) return;
    setIsSearching(true);
    setNeighborhoods([]);
    setSearched(false);

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert door-to-door sales strategist covering ALL types of D2D products. For the location "${q}", list ALL major neighborhoods or districts in that area.

For each neighborhood provide:
- A canvassing_score from 0-100 (based on homeownership, income, density, home age, receptiveness)
- best_for: array of D2D sales types this area is ideal for. Choose from this full list based on the demographics:
  HOME SERVICES: Solar Panels, Roofing, Windows & Doors, Gutters, Siding, HVAC, Pest Control, Lawn Care, Landscaping, Power Washing, House Painting, Home Security (ADT/Vivint), Water Filtration/Softeners, Insulation, Garage Doors
  INSURANCE: Home Insurance, Auto Insurance, Life Insurance, Health Insurance, Medicare/Senior Plans, Final Expense
  TELECOM: Internet/Cable (Xfinity/AT&T), Fiber Internet, Satellite TV
  FINANCIAL: Mortgage Refinancing, Solar Financing, Home Equity
  OTHER: Meal Kits, Charity/Nonprofit, Political Canvassing, Real Estate Leads
- why_good: 1-2 sentences on why it's a good canvassing area for those products
- watch_out: 1 sentence on any challenge (HOA rules, gated, rentals, etc.)
- best_times: best days/times to knock (e.g. "Weekday evenings 5-8pm, Saturday mornings")
- product_focus: top 3-5 specific D2D products most likely to convert in this neighborhood based on home age, income, ownership
- area_type: one of "Suburban", "Urban", "Rural", "Mixed", "Commercial", "Senior Community"
- ownership_rate (%), median_income, market_trend (rising/stable/declining)
- zip_code if known

Rank from highest to lowest canvassing_score. Be specific and realistic to this actual location.`,
      add_context_from_internet: true,
      model: "gemini_3_flash",
      response_json_schema: {
        type: "object",
        properties: {
          city_name: { type: "string" },
          neighborhoods: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                canvassing_score: { type: "number" },
                best_for: { type: "array", items: { type: "string" } },
                why_good: { type: "string" },
                watch_out: { type: "string" },
                best_times: { type: "string" },
                product_focus: { type: "array", items: { type: "string" } },
                area_type: { type: "string" },
                ownership_rate: { type: "number" },
                median_income: { type: "number" },
                market_trend: { type: "string", enum: ["rising", "stable", "declining"] },
                zip_code: { type: "string" },
              },
            },
          },
        },
      },
    });

    if (result?.neighborhoods) {
      setNeighborhoods(result.neighborhoods);
      setCityName(result.city_name || q);
    }
    setIsSearching(false);
    setSearched(true);
  };

  return (
    <div className="pb-24">
      {/* Header section */}
      <div className="px-5 pt-5 pb-4">
        <Link
          to="/people"
          className="mb-4 flex items-center gap-3 p-3.5 bg-card border border-border rounded-xl hover:bg-muted/40 transition-colors shadow-sm"
        >
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground leading-tight">People Met</p>
            <p className="text-xs text-muted-foreground">Log contacts from the field</p>
          </div>
        </Link>

        <Link
          to="/finder"
          className="mb-4 flex items-center gap-3 p-3.5 bg-primary rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
        >
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
            <Phone className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">Generate Cold Call Scripts</p>
            <p className="text-xs text-white/70">AI-powered insurance outreach</p>
          </div>
        </Link>

        <h1 className="text-xl font-black text-foreground leading-tight">Neighborhood Intel</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Enter any city or ZIP code to see which neighborhoods are best for canvassing.
        </p>
      </div>

      {/* Search */}
      <div className="px-5 mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="City, town, or ZIP code..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
              className="pl-10 h-11 rounded-xl text-sm bg-card border-border"
            />
          </div>
          <Button
            onClick={search}
            disabled={isSearching || query.trim().length < 2}
            className="h-11 px-5 rounded-xl font-semibold gap-2"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Loading */}
      {isSearching && (
        <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
          <p className="font-bold text-foreground">Analyzing neighborhoods...</p>
          <p className="text-sm text-muted-foreground mt-1">Finding the best areas to canvass</p>
        </div>
      )}

      {/* Results */}
      {!isSearching && neighborhoods.length > 0 && (
        <div className="px-5 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-bold text-foreground">{cityName}</p>
            <span className="text-xs text-muted-foreground">{neighborhoods.length} neighborhoods</span>
          </div>
          {neighborhoods.map((n, i) => (
            <NeighborhoodCard key={i} n={n} rank={i + 1} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isSearching && searched && neighborhoods.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
          <MapPin className="w-10 h-10 text-muted-foreground mb-3" />
          <p className="font-bold text-foreground">No results found</p>
          <p className="text-sm text-muted-foreground mt-1">Try a different city or ZIP code</p>
        </div>
      )}

      {/* Initial state */}
      {!isSearching && !searched && (
        <div className="px-5">
          <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Quick Start</p>
          <div className="grid grid-cols-2 gap-2">
            {["Detroit, MI", "Austin, TX", "Phoenix, AZ", "Charlotte, NC", "Tampa, FL", "Columbus, OH"].map((city) => (
              <button
                key={city}
                onClick={() => { setQuery(city); }}
                className="text-left p-3 bg-card border border-border rounded-xl hover:bg-muted/40 transition-colors"
              >
                <p className="text-sm font-semibold text-foreground">{city}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}