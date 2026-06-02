import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, TrendingUp, Target, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";

export default function AIInsightsPanel({ leads, territory }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const generateInsights = async () => {
    if (!leads.length) return;
    setLoading(true);

    const stats = {
      total: leads.length,
      sold: leads.filter(l => l.status === "sold").length,
      interested: leads.filter(l => l.status === "interested").length,
      appointment_set: leads.filter(l => l.status === "appointment_set").length,
      follow_up: leads.filter(l => l.status === "follow_up").length,
      not_visited: leads.filter(l => l.status === "not_visited").length,
      no_answer: leads.filter(l => l.status === "no_answer").length,
      not_interested: leads.filter(l => l.status === "not_interested").length,
      avg_score: Math.round(leads.filter(l => l.lead_score != null).reduce((s, l) => s + l.lead_score, 0) / Math.max(leads.filter(l => l.lead_score != null).length, 1)),
      high_priority: leads.filter(l => l.ai_priority === "high").length,
      homeowners: leads.filter(l => l.is_homeowner).length,
    };

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert door-to-door sales coach. Analyze these territory stats and provide actionable insights.

Territory: ${territory?.name || "Unknown"} | City: ${territory?.city || "Unknown"}
Stats: ${JSON.stringify(stats)}

Provide:
1. Top 3 prioritized action items for today
2. Conversion rate analysis and what it means
3. Best time windows to revisit no-answer homes
4. Which lead segments to focus on
5. One motivational insight based on the data`,
      response_json_schema: {
        type: "object",
        properties: {
          conversion_rate_pct: { type: "number" },
          conversion_analysis: { type: "string" },
          action_items: { type: "array", items: { type: "string" } },
          best_revisit_times: { type: "string" },
          focus_segment: { type: "string" },
          motivational_insight: { type: "string" },
          territory_score: { type: "number" },
        },
      },
    });

    setInsights(res);
    setExpanded(true);
    setLoading(false);
  };

  const score = insights?.territory_score;
  const scoreColor = score >= 70 ? "text-green-600" : score >= 40 ? "text-yellow-600" : "text-red-500";

  return (
    <div className="bg-card border-b border-border">
      <div className="px-4 py-3 flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold text-foreground">AI Sales Coach</p>
          {insights?.territory_score != null && (
            <p className="text-xs text-muted-foreground">Territory score: <span className={`font-bold ${scoreColor}`}>{insights.territory_score}/100</span></p>
          )}
        </div>
        {insights && (
          <button onClick={() => setExpanded(!expanded)} className="p-1 rounded hover:bg-muted">
            {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </button>
        )}
        <Button
          onClick={generateInsights}
          disabled={loading || leads.length === 0}
          size="sm"
          variant={insights ? "outline" : "default"}
          className="h-8 px-3 text-xs"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1" />}
          {insights ? "Refresh" : "Analyze"}
        </Button>
      </div>

      {expanded && insights && (
        <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
          {/* Action items */}
          {insights.action_items?.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Target className="w-3.5 h-3.5 text-primary" />
                <p className="text-xs font-bold text-foreground uppercase tracking-wider">Today's Actions</p>
              </div>
              <div className="space-y-1.5">
                {insights.action_items.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-foreground">
                    <span className="text-primary font-bold flex-shrink-0 mt-0.5">{i + 1}.</span>
                    <p className="leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conversion analysis */}
          {insights.conversion_analysis && (
            <div className="bg-blue-50 rounded-xl p-3">
              <div className="flex items-start gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800 leading-relaxed">{insights.conversion_analysis}</p>
              </div>
            </div>
          )}

          {/* Focus segment */}
          {insights.focus_segment && (
            <div className="bg-yellow-50 rounded-xl p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-yellow-700 mb-0.5">Focus On</p>
                  <p className="text-xs text-yellow-800 leading-relaxed">{insights.focus_segment}</p>
                </div>
              </div>
            </div>
          )}

          {/* Best revisit times */}
          {insights.best_revisit_times && (
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Best Revisit Times</p>
              <p className="text-xs text-foreground leading-relaxed">{insights.best_revisit_times}</p>
            </div>
          )}

          {/* Motivational */}
          {insights.motivational_insight && (
            <div className="bg-green-50 rounded-xl p-3">
              <p className="text-xs font-bold text-green-700 mb-0.5">💪 Coach Says</p>
              <p className="text-xs text-green-800 italic leading-relaxed">"{insights.motivational_insight}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}