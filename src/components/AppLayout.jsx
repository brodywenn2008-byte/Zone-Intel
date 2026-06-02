import { useLocation } from "react-router-dom";
import Header from "./Header";
import BottomTabs from "./BottomTabs";
import ValueMapTab from "./ValueMapTab";
import OpportunityFinderTab from "./OpportunityFinderTab";

export default function AppLayout() {
  const location = useLocation();
  
  const getActiveTab = () => {
    if (location.pathname === "/finder") return "finder";
    return "map";
  };

  const activeTab = getActiveTab();

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto relative">
      <Header title={activeTab === "finder" ? "Cold Call Outreach" : "D2D Sales"} />

      {/* Both tabs stay mounted — CSS toggling preserves scroll & state */}
      <div style={{ display: activeTab === "map" ? "block" : "none", paddingBottom: "80px" }}>
        <ValueMapTab />
      </div>
      <div style={{ display: activeTab === "finder" ? "block" : "none", paddingBottom: "80px" }}>
        <OpportunityFinderTab />
      </div>

      <BottomTabs activeTab={activeTab} onTabChange={(tab) => {
        window.history.pushState(null, "", tab === "finder" ? "/finder" : "/");
        window.dispatchEvent(new PopStateEvent("popstate"));
      }} />
    </div>
  );
}