import { Link, useLocation } from "react-router-dom";
import { Settings, ArrowLeft } from "lucide-react";

const CHILD_ROUTES = ["/settings", "/canvas", "/people", "/crm"];

export default function Header({ title }) {
  const location = useLocation();
  const isChildRoute = CHILD_ROUTES.some(r => location.pathname.startsWith(r));

  return (
    <div className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border px-5 py-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {isChildRoute ? (
            <Link
              to="/"
              className="flex items-center justify-center min-w-[44px] min-h-[44px] -ml-2 rounded-xl hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </Link>
          ) : (
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-xs font-black">D2</span>
            </div>
          )}
          <h1 className="text-lg font-bold text-foreground tracking-tight">{title}</h1>
        </div>
        {!isChildRoute && (
          <Link
            to="/settings"
            className="flex items-center justify-center min-w-[44px] min-h-[44px] rounded-xl hover:bg-muted transition-colors"
          >
            <Settings className="w-5 h-5 text-muted-foreground" />
          </Link>
        )}
      </div>
    </div>
  );
}