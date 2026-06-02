import { Map, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "map", label: "D2D Sales", icon: Map, path: "/" },
  { id: "finder", label: "Cold Calls", icon: Search, path: "/finder" },
];

export default function BottomTabs({ activeTab, onTabChange }) {
  const navigate = useNavigate();

  const handleTabChange = (tab) => {
    navigate(tab.path);
    onTabChange?.(tab.id);
  };
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="max-w-lg mx-auto flex">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab)}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-3 min-h-[56px] transition-all duration-200",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("w-5 h-5", active && "scale-110")} strokeWidth={active ? 2.5 : 2} />
              <span className={cn("text-xs font-medium", active && "font-semibold")}>
                {tab.label}
              </span>
              {active && (
                <div className="absolute bottom-0 w-12 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}