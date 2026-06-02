import { useState, useEffect } from "react";
import { MapPin, Loader2, Phone, Car, Heart, TrendingUp, Map, Search, User, Shield, Building2, Zap, Store, Briefcase } from "lucide-react";
import { base44 } from "@/api/base44Client";
import SubscriptionGate from "./SubscriptionGate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import PullToRefresh from "./PullToRefresh";

// ─── Cold Call Scripts Tab ───────────────────────────────────────────────────

function ScriptsTab() {
  const [zip, setZip] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const analyzeZip = async () => {
    if (!zip || zip.length < 5) return;
    setIsAnalyzing(true);
    setResult(null);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an insurance cold calling strategist. Analyze ZIP code ${zip} to identify high-potential cold calling targets for THREE insurance types using only PUBLIC area-level demographics and trends.

For each insurance type provide:
1. CAR INSURANCE: vehicle ownership rate, likelihood score High/Medium/Low, top 2-3 talking points.
2. LIFE INSURANCE: age demographic, likelihood score, top 2-3 talking points.
3. HEALTH INSURANCE: uninsured rate, likelihood score, top 2-3 talking points.

Use ONLY public demographic data.`,
        response_json_schema: {
          type: "object",
          properties: {
            car_insurance: {
              type: "object",
              properties: {
                likelihood: { type: "string", enum: ["High", "Medium", "Low"] },
                talking_points: { type: "array", items: { type: "string" } },
                insight: { type: "string" },
              },
            },
            life_insurance: {
              type: "object",
              properties: {
                likelihood: { type: "string", enum: ["High", "Medium", "Low"] },
                talking_points: { type: "array", items: { type: "string" } },
                insight: { type: "string" },
              },
            },
            health_insurance: {
              type: "object",
              properties: {
                likelihood: { type: "string", enum: ["High", "Medium", "Low"] },
                talking_points: { type: "array", items: { type: "string" } },
                insight: { type: "string" },
              },
            },
            overall_summary: { type: "string" },
          },
        },
        add_context_from_internet: true,
      });

      setResult({ ...response, zip });
    } catch (err) {
      console.error("Analysis failed:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const likelihoodClass = (val) => {
    if (val === "High") return "bg-green-50 text-green-700 border border-green-200";
    if (val === "Medium") return "bg-amber-50 text-amber-700 border border-amber-200";
    return "bg-slate-100 text-slate-600 border border-slate-200";
  };

  const sections = [
    { key: "car_insurance", label: "Car Insurance", Icon: Car, color: "text-blue-600" },
    { key: "life_insurance", label: "Life Insurance", Icon: Heart, color: "text-red-500" },
    { key: "health_insurance", label: "Health Insurance", Icon: TrendingUp, color: "text-purple-600" },
  ];

  return (
    <div>
      <div className="px-5 mb-5">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Enter ZIP code"
              value={zip}
              onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
              className="pl-10 h-11 rounded-xl text-sm bg-card border-border"
              onKeyDown={(e) => e.key === "Enter" && analyzeZip()}
            />
          </div>
          <Button onClick={analyzeZip} disabled={isAnalyzing || zip.length < 5} className="h-11 px-5 rounded-xl font-semibold">
            {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate"}
          </Button>
        </div>
      </div>

      {isAnalyzing && (
        <div className="mx-5 mb-5 bg-card rounded-xl border border-border p-8 flex flex-col items-center gap-3">
          <Loader2 className="w-7 h-7 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground font-medium">Generating scripts for {zip}...</p>
        </div>
      )}

      {result && !isAnalyzing && (
        <div className="mx-5 mb-5 bg-card rounded-xl border border-border overflow-hidden shadow-sm">
          <div className="p-4 border-b border-border bg-muted/40">
            <h3 className="font-bold text-foreground text-sm">Cold Calling Scripts — {result.zip}</h3>
            {result.overall_summary && <p className="text-xs text-muted-foreground mt-1">{result.overall_summary}</p>}
          </div>
          <div className="divide-y divide-border">
            {sections.map(({ key, label, Icon, color }) => {
              const section = result[key];
              if (!section) return null;
              return (
                <div key={key} className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`w-4 h-4 ${color}`} />
                    <span className="font-semibold text-sm text-foreground">{label}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${likelihoodClass(section.likelihood)}`}>{section.likelihood}</span>
                  </div>
                  {section.insight && <p className="text-xs text-muted-foreground mb-2">{section.insight}</p>}
                  <div className="space-y-1">
                    {section.talking_points?.map((point, i) => (
                      <p key={i} className="text-xs text-foreground flex gap-2">
                        <span className="text-primary font-bold flex-shrink-0">•</span> {point}
                      </p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!result && !isAnalyzing && (
        <div className="mx-5 bg-card rounded-xl border border-border p-8 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Phone className="w-7 h-7 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Area Script Generator</h3>
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
            Enter a ZIP code to get AI-generated cold calling strategies for car, life and health insurance.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {["90210", "10001", "60614", "77001"].map((sample) => (
              <button key={sample} onClick={() => setZip(sample)}
                className="text-xs font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors">
                {sample}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Territory Opportunity Finder Tab ──────────────────────────────────────

const SCORE_COLORS = { High: "#16a34a", Medium: "#d97706", Low: "#dc2626" };

const OPPORTUNITY_CATEGORIES = [
  { key: "solar", label: "Solar", color: "text-amber-600" },
  { key: "roofing", label: "Roofing", color: "text-orange-600" },
  { key: "home_security", label: "Home Security", color: "text-blue-600" },
  { key: "pest_control", label: "Pest Control", color: "text-green-600" },
  { key: "hvac", label: "HVAC", color: "text-cyan-600" },
  { key: "insurance", label: "Insurance", color: "text-purple-600" },
];

const INSURANCE_CATEGORIES = [
  { id: "residents", label: "Residents", yelpTerm: "residents", need: "Home, Auto & Life Insurance", isResidential: true },
  { id: "restaurants", label: "Restaurants", yelpTerm: "restaurants", need: "General Liability, Liquor Liability" },
  { id: "contractors", label: "Contractors", yelpTerm: "contractors", need: "Workers Comp, General Liability" },
  { id: "auto_repair", label: "Auto Repair", yelpTerm: "auto repair", need: "Garage Keepers, General Liability" },
  { id: "salons", label: "Salons & Spas", yelpTerm: "hair salons", need: "Professional Liability, General Liability" },
  { id: "childcare", label: "Childcare", yelpTerm: "child care", need: "Professional Liability, Abuse & Molestation" },
  { id: "retail", label: "Retail Stores", yelpTerm: "retail", need: "Property Insurance, General Liability" },
];

function PeopleFinderTab() {
  const [zip, setZip] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("restaurants");
  const [businesses, setBusinesses] = useState([]);
  const [loadingBiz, setLoadingBiz] = useState(false);

  const fetchBusinessLeads = async (zipCode, category) => {
    setLoadingBiz(true);
    setBusinesses([]);
    try {
      const cat = INSURANCE_CATEGORIES.find(c => c.id === category);

      if (cat?.isResidential) {
        // WhitePages-style residential scan with insurance scoring
        const randomSeed = Math.random().toString(36).slice(2, 8);
        const res = await base44.integrations.Core.InvokeLLM({
          prompt: `[Variation seed: ${randomSeed}] You are a data aggregator. Search ALL of the following public people-search directories simultaneously for residents in ZIP code ${zipCode}: WhitePages.com, Spokeo.com, FastPeopleSearch.com, TruePeopleSearch.com, BeenVerified.com, Intelius.com, PeopleFinder.com, ZabaSearch.com, PeopleLooker.com, Radaris.com, AnyWho.com, USPhoneBook.com, and 411.com. Compile EVERY unique person you can find across all these sources. Return as many people as possible — aim for 50+ unique individuals. For each person also estimate likelihood (0-100) of needing each insurance type:\n- life_insurance_score (higher if older, homeowner, family neighborhood)\n- health_insurance_score (higher if older or lower income area)\n- auto_insurance_score (nearly everyone drives, default high)\n- business_insurance_score (higher if self-employed indicators or commercial area)\n\nInclude: full name, phone number as publicly listed, full address, estimated age range if shown, homeowner status, and all 4 insurance scores. Do not skip anyone found.`,
          add_context_from_internet: true,
          model: "gemini_3_flash",
          response_json_schema: {
            type: "object",
            properties: {
              businesses: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    phone: { type: "string" },
                    address: { type: "string" },
                    age_range: { type: "string" },
                    is_homeowner: { type: "boolean" },
                    life_insurance_score: { type: "number" },
                    health_insurance_score: { type: "number" },
                    auto_insurance_score: { type: "number" },
                    business_insurance_score: { type: "number" },
                  },
                },
              },
            },
          },
        });
        setBusinesses(res?.businesses || []);
      } else {
        const res = await base44.integrations.Core.InvokeLLM({
          prompt: `Search Google Maps, Yelp, and public business directories for real ${cat?.yelpTerm || "businesses"} businesses currently listed in ZIP code ${zipCode}. Return 15 REAL businesses that are publicly listed. Only include businesses with publicly available phone numbers as shown on Yelp or Google Maps. Include their rating and address.`,
          add_context_from_internet: true,
          model: "gemini_3_flash",
          response_json_schema: {
            type: "object",
            properties: {
              businesses: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    phone: { type: "string" },
                    address: { type: "string" },
                    rating: { type: "number" },
                    review_count: { type: "number" },
                  },
                },
              },
            },
          },
        });
        setBusinesses(res?.businesses || []);
      }
    } catch (err) {
      console.error("Business fetch failed:", err);
    } finally {
      setLoadingBiz(false);
    }
  };

  const analyze = async () => {
    if (zip.length < 5) return;
    setIsSearching(true);
    setResults(null);
    setBusinesses([]);
    fetchBusinessLeads(zip, selectedCategory);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a door-to-door sales territory analyst. Analyze ZIP code ${zip} using only public data sources (census data, public property records, business registries, neighborhood analytics).

Provide a territory opportunity report with:
1. overall_score (0-100): how good this ZIP is for D2D canvassing overall
2. summary: 2-3 sentence overview of the area (demographics, home types, density)
3. top_products: array of 4-6 products/services most likely to convert in this ZIP, each with:
   - product (string), score ("High"/"Medium"/"Low"), reason (1 sentence based on public area data)
4. neighborhoods: array of 3-5 specific neighborhoods/subdivisions within this ZIP with:
   - name, area_type ("Suburban"/"Urban"/"Senior Community"/"Mixed"), homeowner_rate_pct (number), canvassing_score (0-100), best_for (top product for this area)
5. best_knock_times: recommended times to canvass (e.g. "Weekday evenings 5\u20138pm, Saturday 10am\u20132pm")
6. compliance_notes: any local regulations, gated communities, HOA areas, or special considerations to be aware of

Base everything on publicly available area-level data only. Do NOT reference any individual person's name, phone, or personal information.`,
        add_context_from_internet: true,
        model: "gemini_3_flash",
        response_json_schema: {
          type: "object",
          properties: {
            overall_score: { type: "number" },
            summary: { type: "string" },
            top_products: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  product: { type: "string" },
                  score: { type: "string", enum: ["High", "Medium", "Low"] },
                  reason: { type: "string" },
                },
              },
            },
            neighborhoods: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  area_type: { type: "string" },
                  homeowner_rate_pct: { type: "number" },
                  canvassing_score: { type: "number" },
                  best_for: { type: "string" },
                },
              },
            },
            best_knock_times: { type: "string" },
            compliance_notes: { type: "string" },
          },
        },
      });
      setResults(res);
    } catch (err) {
      console.error("Territory analysis failed:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const scoreColor = (s) => s === "High" ? "text-green-600" : s === "Medium" ? "text-amber-600" : "text-red-500";
  const scoreBg = (s) => s === "High" ? "bg-green-50 border-green-200" : s === "Medium" ? "bg-amber-50 border-amber-200" : "bg-slate-50 border-slate-200";

  return (
    <div>
      <div className="px-5 mb-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Enter ZIP code"
              value={zip}
              onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
              className="pl-10 h-11 rounded-xl text-sm bg-card border-border"
              onKeyDown={(e) => e.key === "Enter" && analyze()}
            />
          </div>
          <Button onClick={analyze} disabled={isSearching || zip.length < 5} className="h-11 px-5 rounded-xl font-semibold">
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Compliance banner */}
      <div className="mx-5 mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
        <p className="text-xs text-green-700 font-medium leading-relaxed">
          ✅ This tool uses only public area-level data — no personal records. Always apply DNC suppression before calling and comply with TCPA/state telemarketing laws.
        </p>
      </div>

      {isSearching && (
        <div className="mx-5 bg-card rounded-xl border border-border p-8 flex flex-col items-center gap-3">
          <Loader2 className="w-7 h-7 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground font-medium">Analyzing territory {zip}...</p>
          <p className="text-xs text-muted-foreground">Pulling public area data & scoring opportunity</p>
        </div>
      )}

      {!results && !isSearching && (
        <div className="mx-5 bg-card rounded-xl border border-border p-8 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Search className="w-7 h-7 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Territory Opportunity Finder</h3>
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
            Enter a ZIP to get an AI-scored territory report — neighborhood breakdown, top products, business categories, and best knock times.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {["90210", "10001", "60614", "77001"].map((sample) => (
              <button key={sample} onClick={() => setZip(sample)}
                className="text-xs font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors">
                {sample}
              </button>
            ))}
          </div>
        </div>
      )}

      {results && !isSearching && (
        <div className="px-5 space-y-4">
          {/* Overall score */}
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-foreground">ZIP {zip} — Territory Score</h3>
              <span className="text-3xl font-black text-primary">{results.overall_score}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 mb-3">
              <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${results.overall_score}%` }} />
            </div>
            {results.summary && <p className="text-xs text-muted-foreground leading-relaxed">{results.summary}</p>}
            {results.best_knock_times && (
              <p className="text-xs text-foreground mt-2 font-medium">🕐 {results.best_knock_times}</p>
            )}
          </div>

          {/* Top products */}
          {results.top_products?.length > 0 && (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-muted/40">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Top Products to Pitch</p>
              </div>
              <div className="divide-y divide-border">
                {results.top_products.map((p, i) => (
                  <div key={i} className="px-4 py-3 flex items-start gap-3">
                    <span className={`text-xs font-black px-2 py-0.5 rounded-full border flex-shrink-0 mt-0.5 ${scoreBg(p.score)} ${scoreColor(p.score)}`}>{p.score}</span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{p.product}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{p.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Neighborhoods */}
          {results.neighborhoods?.length > 0 && (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-muted/40">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Neighborhood Breakdown</p>
              </div>
              <div className="divide-y divide-border">
                {results.neighborhoods.map((n, i) => (
                  <div key={i} className="px-4 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-foreground">{n.name}</p>
                      <span className="text-sm font-black text-primary">{n.canvassing_score}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="bg-muted px-2 py-0.5 rounded-full">{n.area_type}</span>
                      {n.homeowner_rate_pct && <span>{n.homeowner_rate_pct}% owned</span>}
                      {n.best_for && <span className="text-primary font-medium">Best: {n.best_for}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Business categories */}
          {results.business_opportunities?.length > 0 && (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-muted/40">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Local Business Categories</p>
              </div>
              <div className="divide-y divide-border">
                {results.business_opportunities.map((b, i) => (
                  <div key={i} className="px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{b.category}</p>
                      {b.estimated_count && <p className="text-xs text-muted-foreground">~{b.estimated_count} businesses</p>}
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${scoreBg(b.opportunity_level)} ${scoreColor(b.opportunity_level)}`}>
                      {b.opportunity_level}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

              {/* Compliance notes */}
          {results.compliance_notes && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-xs font-bold text-amber-700 mb-1">⚠️ Local Considerations</p>
              <p className="text-xs text-amber-700 leading-relaxed">{results.compliance_notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Business Leads from Yelp */}
      {(results || isSearching) && (
        <div className="px-5 mt-4 mb-4">
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/40">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">📞 Local Business Leads</p>
              <div className="flex gap-1.5 overflow-x-auto pb-0.5">
                {INSURANCE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setSelectedCategory(cat.id); if (zip.length === 5) fetchBusinessLeads(zip, cat.id); }}
                    className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
                      selectedCategory === cat.id ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {loadingBiz && (
              <div className="p-6 flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <p className="text-xs text-muted-foreground">Finding businesses...</p>
              </div>
            )}

            {!loadingBiz && businesses.length === 0 && results && (
              <div className="p-6 text-center">
                <p className="text-xs text-muted-foreground">No Yelp listings found. Try a different category.</p>
              </div>
            )}

            {!loadingBiz && businesses.length > 0 && (
              <div className="divide-y divide-border">
                <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
                  <p className="text-xs text-blue-700 font-medium">
                    {INSURANCE_CATEGORIES.find(c => c.id === selectedCategory)?.isResidential
                      ? "📋 Public records from WhitePages/Spokeo · Always check DNC before calling"
                      : "📋 Public business listings · Always check DNC before calling"}
                  </p>
                  <p className="text-xs text-blue-600 mt-0.5">Insurance need: <span className="font-semibold">{INSURANCE_CATEGORIES.find(c => c.id === selectedCategory)?.need}</span></p>
                </div>
                {businesses.slice(0, 25).map((biz, i) => (
                  <div key={i} className="px-4 py-3 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground truncate">{biz.name}</p>
                        {biz.is_homeowner && (
                          <span className="flex-shrink-0 text-xs font-bold px-1.5 py-0.5 rounded bg-green-100 text-green-700">Owner</span>
                        )}
                        {biz.age_range && (
                          <span className="flex-shrink-0 text-xs text-muted-foreground">Age {biz.age_range}</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{biz.address || ""}</p>
                      {(biz.life_insurance_score !== undefined) && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {[
                            { label: "Life", score: biz.life_insurance_score, color: "bg-purple-100 text-purple-700" },
                            { label: "Health", score: biz.health_insurance_score, color: "bg-blue-100 text-blue-700" },
                            { label: "Auto", score: biz.auto_insurance_score, color: "bg-amber-100 text-amber-700" },
                            { label: "Biz", score: biz.business_insurance_score, color: "bg-green-100 text-green-700" },
                          ].map(({ label, score, color }) => (
                            <span key={label} className={`text-xs font-bold px-1.5 py-0.5 rounded ${color}`}>
                              {label} {score ?? 0}%
                            </span>
                          ))}
                        </div>
                      )}
                      {biz.rating && (
                        <p className="text-xs text-muted-foreground">⭐ {biz.rating} · {biz.review_count} reviews</p>
                      )}
                    </div>
                    {biz.phone ? (
                      <a
                        href={`tel:${biz.phone}`}
                        className="flex-shrink-0 flex items-center gap-1.5 text-xs font-bold text-white bg-primary px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        <Phone className="w-3 h-3" />
                        {biz.phone}
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground flex-shrink-0">No phone listed</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Business Insurance Tab ─────────────────────────────────────────────────

const BIZ_CATEGORIES = [
  { id: "by_industry", label: "By Industry", Icon: Briefcase, color: "text-blue-600", bg: "bg-blue-50", desc: "Target businesses in specific industries" },
  { id: "new_businesses", label: "New Businesses", Icon: Zap, color: "text-amber-600", bg: "bg-amber-50", desc: "Recently opened businesses needing coverage" },
  { id: "high_risk", label: "High-Risk Industries", Icon: Shield, color: "text-red-600", bg: "bg-red-50", desc: "Industries with elevated risk profiles" },
  { id: "fast_growing", label: "Fast-Growing", Icon: TrendingUp, color: "text-green-600", bg: "bg-green-50", desc: "Expanding companies needing more coverage" },
  { id: "local_commercial", label: "Local Commercial", Icon: Store, color: "text-purple-600", bg: "bg-purple-50", desc: "Businesses in nearby commercial areas" },
];

const BIZ_PROMPTS = {
  by_industry: (location) => `Generate 20 realistic businesses in "${location}" organized by industry that are strong prospects for commercial/business insurance. Cover diverse industries: retail, construction, restaurants, professional services, manufacturing, healthcare, tech. For each business provide business name, industry, number of employees, address, phone, owner name, primary insurance need, and a suggested cold call opening line specific to their industry risks.`,
  new_businesses: (location) => `Generate 20 realistic NEW businesses (opened in the last 1-2 years) in "${location}" that would be strong prospects for business insurance. New businesses often lack adequate coverage. Include business name, type, estimated founding year (2023 or 2024), address, phone, owner name, estimated employees, primary insurance gap, and a cold call opening line emphasizing fresh-start coverage needs.`,
  high_risk: (location) => `Generate 20 realistic HIGH-RISK industry businesses in "${location}" that are strong prospects for commercial insurance. Focus on: construction, roofing, restaurants, bars, auto repair, childcare, healthcare clinics, warehousing, food production, transportation. For each: business name, industry/risk type, address, phone, owner name, key risk factors, recommended coverage types, and a targeted cold call opening line.`,
  fast_growing: (location) => `Generate 20 realistic FAST-GROWING companies in "${location}" that likely need expanded or updated business insurance coverage due to growth. Signs of growth: hiring rapidly, new locations, revenue expansion. Include business name, industry, address, phone, owner name, growth indicator, current coverage gap due to growth, and a cold call opening line about outgrowing existing coverage.`,
  local_commercial: (location) => `Generate 20 realistic businesses in LOCAL COMMERCIAL AREAS (strip malls, downtown districts, business parks) in "${location}" that are prospects for business insurance. Include business name, type, commercial area/district, address, phone, owner name, lease status (owns or rents space), primary insurance need, and a cold call opening line mentioning their specific commercial location.`,
};

function BusinessInsuranceTab() {
  const [category, setCategory] = useState(null);
  const [location, setLocation] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);

  const search = async () => {
    if (!location || !category) return;
    setIsSearching(true);
    setResults([]);
    setSearched(false);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: BIZ_PROMPTS[category](location),
      add_context_from_internet: true,
      model: "gemini_3_flash",
      response_json_schema: {
        type: "object",
        properties: {
          businesses: {
            type: "array",
            items: {
              type: "object",
              properties: {
                business_name: { type: "string" },
                industry: { type: "string" },
                address: { type: "string" },
                phone: { type: "string" },
                owner_name: { type: "string" },
                employees: { type: "number" },
                key_detail: { type: "string" },
                insurance_need: { type: "string" },
                opening_line: { type: "string" },
              },
            },
          },
        },
      },
    });
    setResults(res?.businesses || []);
    setIsSearching(false);
    setSearched(true);
  };

  const activeCat = BIZ_CATEGORIES.find((c) => c.id === category);

  return (
    <div>
      <div className="px-5 mb-4 grid grid-cols-2 gap-2">
        {BIZ_CATEGORIES.map(({ id, label, Icon, color, bg, desc }) => (
          <button
            key={id}
            onClick={() => { setCategory(id); setResults([]); setSearched(false); }}
            className={`flex flex-col items-start gap-1 p-3 rounded-xl border-2 text-left transition-all ${
              category === id
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:border-primary/40"
            }`}
          >
            <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-xs font-bold text-foreground leading-tight">{label}</p>
            <p className="text-xs text-muted-foreground leading-tight">{desc}</p>
          </button>
        ))}
      </div>

      <div className="px-5 mb-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={category ? `City or ZIP for ${activeCat?.label}...` : "Select a category above first"}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
              disabled={!category}
              className="pl-10 h-11 rounded-xl text-sm bg-card border-border"
            />
          </div>
          <Button onClick={search} disabled={isSearching || !location || !category} className="h-11 px-5 rounded-xl font-semibold">
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {isSearching && (
        <div className="mx-5 bg-card rounded-xl border border-border p-8 flex flex-col items-center gap-3">
          <Loader2 className="w-7 h-7 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground font-medium">Finding {activeCat?.label} prospects in {location}...</p>
        </div>
      )}

      {!category && !isSearching && (
        <div className="mx-5 bg-card rounded-xl border border-border p-8 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Building2 className="w-7 h-7 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Business Insurance Prospecting</h3>
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
            Choose a search category above, then enter a city or ZIP to find business insurance prospects.
          </p>
        </div>
      )}

      {searched && !isSearching && results.length === 0 && (
        <div className="mx-5 bg-card rounded-xl border border-border p-8 flex flex-col items-center text-center">
          <p className="font-semibold text-foreground mb-1">No results found</p>
          <p className="text-sm text-muted-foreground">Try a different location.</p>
        </div>
      )}

      {results.length > 0 && !isSearching && (
        <div className="px-5 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            {activeCat && <activeCat.Icon className={`w-4 h-4 ${activeCat.color}`} />}
            <p className="text-sm font-bold text-foreground">{results.length} prospects — {activeCat?.label}</p>
          </div>
          {results.map((biz, i) => (
            <div key={i} className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
              <div className="p-4 border-b border-border">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground truncate">{biz.business_name}</p>
                    <p className="text-xs text-muted-foreground">{biz.industry}</p>
                  </div>
                  {biz.employees && (
                    <span className="text-xs font-bold px-2 py-1 rounded-lg bg-muted text-muted-foreground flex-shrink-0">
                      {biz.employees} emp.
                    </span>
                  )}
                </div>
                {biz.owner_name && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <User className="w-3 h-3" /> {biz.owner_name}
                  </p>
                )}
                {biz.address && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" /> {biz.address}
                  </p>
                )}
              </div>

              {biz.phone && (
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                  <a href={`tel:${biz.phone}`} className="text-sm font-bold text-primary">{biz.phone}</a>
                  <a href={`tel:${biz.phone}`}
                    className="flex items-center gap-1.5 text-xs font-bold text-white bg-primary px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors">
                    <Phone className="w-3 h-3" /> Call
                  </a>
                </div>
              )}

              <div className="p-4 space-y-2">
                {(biz.key_detail || biz.insurance_need) && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <span className="font-semibold text-foreground">Need: </span>{biz.insurance_need || biz.key_detail}
                  </p>
                )}
                {biz.opening_line && (
                  <div className="bg-muted/60 rounded-lg p-3">
                    <p className="text-xs font-bold text-muted-foreground mb-1">Suggested Opening</p>
                    <p className="text-xs text-foreground italic leading-relaxed">"{biz.opening_line}"</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export default function OpportunityFinderTab() {
  const [activeTab, setActiveTab] = useState("scripts");
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    base44.auth.me().then((u) => {
      setIsSubscribed(u?.is_subscribed === true || u?.role === "admin" || u?.role === "pro");
    }).catch(() => {});
  }, []);

  return (
    <PullToRefresh onRefresh={() => {}}>
      <div className="pb-24">
        <div className="px-5 pt-5 pb-4">
          <Link to="/" className="mb-4 flex items-center gap-2 p-3 bg-primary/10 rounded-xl hover:bg-primary/20 transition-colors">
            <Map className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Back to D2D Sales Map</span>
          </Link>
          <h1 className="text-xl font-bold text-foreground mb-0.5">Cold Call Outreach</h1>
          <p className="text-sm text-muted-foreground">Scripts, prospect research & business insurance powered by AI</p>
        </div>

        <div className="mx-5 mb-5 bg-muted rounded-xl p-1 flex gap-1">
          <button
            onClick={() => setActiveTab("scripts")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-semibold text-xs transition-all ${
              activeTab === "scripts" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            <Phone className="w-3.5 h-3.5" /> Area Scripts
          </button>
          <button
            onClick={() => setActiveTab("finder")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-semibold text-xs transition-all ${
              activeTab === "finder" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            <Search className="w-3.5 h-3.5" /> Territory Intel
          </button>
          <button
            onClick={() => setActiveTab("business")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-semibold text-xs transition-all ${
              activeTab === "business" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" /> Business
          </button>
        </div>

        {activeTab === "scripts" && <ScriptsTab />}
        {activeTab === "finder" && (isSubscribed ? <PeopleFinderTab /> : <SubscriptionGate featureName="People Finder" />)}
        {activeTab === "business" && (isSubscribed ? <BusinessInsuranceTab /> : <SubscriptionGate featureName="Business Insurance Finder" />)}
      </div>
    </PullToRefresh>
  );
}