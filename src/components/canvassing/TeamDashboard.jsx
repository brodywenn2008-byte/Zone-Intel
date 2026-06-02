import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Users, TrendingUp, Target, Award, Zap, BarChart2, Clock } from "lucide-react";
import { STATUS_CONFIG } from "./StatusBadge";
import { format, isToday, subDays } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function TeamDashboard({ leads, visits }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const totalLeads = leads.length;
  const sold = leads.filter(l => l.status === "sold").length;
  const interested = leads.filter(l => l.status === "interested").length;
  const appointments = leads.filter(l => l.status === "appointment_set").length;
  const followUps = leads.filter(l => l.status === "follow_up").length;
  const visited = leads.filter(l => l.status !== "not_visited").length;
  const notVisited = leads.filter(l => l.status === "not_visited").length;
  const visitRate = totalLeads > 0 ? Math.round((visited / totalLeads) * 100) : 0;
  const conversionRate = visited > 0 ? Math.round((sold / visited) * 100) : 0;

  const todayVisits = visits.filter(v => isToday(new Date(v.created_date)));

  // Per-rep stats
  const repStats = {};
  leads.forEach(l => {
    const rep = l.assigned_rep || l.created_by;
    if (!rep) return;
    if (!repStats[rep]) repStats[rep] = { sold: 0, interested: 0, visited: 0, appts: 0, follow_up: 0 };
    if (l.status !== "not_visited") repStats[rep].visited++;
    if (l.status === "sold") repStats[rep].sold++;
    if (l.status === "interested") repStats[rep].interested++;
    if (l.status === "appointment_set") repStats[rep].appts++;
    if (l.status === "follow_up") repStats[rep].follow_up++;
  });
  visits.forEach(v => {
    if (v.rep_email && !repStats[v.rep_email]) repStats[v.rep_email] = { sold: 0, interested: 0, visited: 0, appts: 0, follow_up: 0 };
  });

  const leaderboard = Object.entries(repStats)
    .map(([email, s]) => ({ email, ...s, score: s.sold * 10 + s.appts * 5 + s.interested * 2 + s.visited }))
    .sort((a, b) => b.score - a.score);

  const statusChartData = Object.entries(STATUS_CONFIG)
    .map(([key, cfg]) => ({
      name: cfg.label,
      count: leads.filter(l => l.status === key).length,
      color: cfg.mapColor,
    }))
    .filter(d => d.count > 0);

  // AI priority breakdown
  const highPriority = leads.filter(l => l.ai_priority === "high").length;
  const avgScore = leads.length > 0
    ? Math.round(leads.filter(l => l.lead_score != null).reduce((s, l) => s + l.lead_score, 0) / Math.max(leads.filter(l => l.lead_score != null).length, 1))
    : 0;

  const myLeads = user ? leads.filter(l => l.assigned_rep === user.email || l.created_by === user.email) : [];
  const myTodayVisits = user ? todayVisits.filter(v => v.rep_email === user.email || v.created_by === user.email) : [];

  return (
    <div className="overflow-y-auto pb-24 bg-background">
      {/* My Activity Strip */}
      {user && (
        <div className="bg-primary text-white px-4 py-4">
          <p className="text-xs font-bold text-white/60 uppercase tracking-wider mb-3">My Performance Today</p>
          <div className="grid grid-cols-4 gap-2">
            <MiniStat label="Visits" value={myTodayVisits.length} />
            <MiniStat label="Interested" value={myLeads.filter(l => l.status === "interested").length} />
            <MiniStat label="Appts" value={myLeads.filter(l => l.status === "appointment_set").length} />
            <MiniStat label="Sold" value={myLeads.filter(l => l.status === "sold").length} />
          </div>
        </div>
      )}

      <div className="p-4 space-y-4">
        {/* Pipeline Overview */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <p className="text-sm font-bold text-foreground">Territory Pipeline</p>
            <span className="ml-auto text-xs text-muted-foreground">{totalLeads} total leads</span>
          </div>
          <div className="p-4 grid grid-cols-3 gap-3">
            <BigStat label="Coverage" value={`${visitRate}%`} sub={`${visited}/${totalLeads} doors`} color="text-primary" />
            <BigStat label="Conversion" value={`${conversionRate}%`} sub={`${sold} sold`} color="text-green-600" />
            <BigStat label="Avg Score" value={avgScore} sub={`${highPriority} 🔥 high`} color="text-yellow-600" />
          </div>

          <div className="px-4 pb-4 grid grid-cols-2 gap-2">
            <PipelineCard label="Interested" count={interested} color="bg-yellow-500" />
            <PipelineCard label="Appointments" count={appointments} color="bg-purple-500" />
            <PipelineCard label="Follow Ups" count={followUps} color="bg-orange-500" />
            <PipelineCard label="Not Visited" count={notVisited} color="bg-slate-400" />
          </div>
        </div>

        {/* Status Chart */}
        {statusChartData.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <BarChart2 className="w-4 h-4 text-primary" />
              <p className="text-sm font-bold text-foreground">Status Breakdown</p>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={statusChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} angle={-30} textAnchor="end" height={44} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(val, name, p) => [val, p.payload.name]} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {statusChartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Leaderboard */}
        {leaderboard.length > 0 && (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-500" />
              <p className="text-sm font-bold text-foreground">Rep Leaderboard</p>
            </div>
            <div className="divide-y divide-border">
              {leaderboard.slice(0, 8).map((rep, i) => (
                <div key={rep.email} className={`flex items-center gap-3 px-4 py-3 ${i === 0 ? "bg-yellow-50" : ""}`}>
                  <span className={`text-base font-black w-6 text-center flex-shrink-0 ${
                    i === 0 ? "text-yellow-500" : i === 1 ? "text-slate-400" : i === 2 ? "text-orange-400" : "text-muted-foreground"
                  }`}>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate text-foreground">{rep.email.split("@")[0]}</p>
                    <p className="text-xs text-muted-foreground">
                      {rep.visited} knocked · {rep.appts} appts · {rep.follow_up} follow-ups
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-base font-black text-green-600">{rep.sold}</p>
                    <p className="text-xs text-muted-foreground">sold</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {todayVisits.length > 0 && (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <p className="text-sm font-bold text-foreground">Today's Activity</p>
              <span className="ml-auto text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {todayVisits.length} visits
              </span>
            </div>
            <div className="divide-y divide-border">
              {todayVisits.slice(0, 8).map(v => {
                const lead = leads.find(l => l.id === v.lead_id);
                const cfg = STATUS_CONFIG[v.status] || STATUS_CONFIG.knocked;
                return (
                  <div key={v.id} className="flex items-center gap-3 px-4 py-2.5">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{lead?.address || "Unknown Address"}</p>
                      <p className="text-xs text-muted-foreground">{cfg.label}</p>
                    </div>
                    <p className="text-xs text-muted-foreground flex-shrink-0">
                      {format(new Date(v.created_date), "h:mm a")}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {totalLeads === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <TrendingUp className="w-12 h-12 text-muted-foreground mb-3" />
            <p className="font-bold text-foreground mb-1">No data yet</p>
            <p className="text-sm text-muted-foreground">Load leads in a territory to see analytics.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="text-xs text-white/60 font-medium">{label}</p>
    </div>
  );
}

function BigStat({ label, value, sub, color }) {
  return (
    <div className="bg-muted/30 rounded-xl p-3 text-center">
      <p className={`text-2xl font-black ${color}`}>{value}</p>
      <p className="text-xs font-semibold text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

function PipelineCard({ label, count, color }) {
  return (
    <div className="flex items-center gap-2.5 p-3 bg-muted/30 rounded-xl">
      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${color}`} />
      <p className="text-xs text-muted-foreground flex-1">{label}</p>
      <p className="text-sm font-black text-foreground">{count}</p>
    </div>
  );
}