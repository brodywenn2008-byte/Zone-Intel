import { useState, useRef, useEffect } from "react";
import { RefreshCw } from "lucide-react";

export default function PullToRefresh({ onRefresh, children }) {
  const [pulling, setPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef(null);
  const startYRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e) => {
      if (container.scrollTop === 0) {
        startYRef.current = e.touches[0].clientY;
        setPulling(true);
      }
    };

    const handleTouchMove = (e) => {
      if (!pulling || container.scrollTop > 0) return;

      const distance = e.touches[0].clientY - startYRef.current;
      if (distance > 0) {
        setPullDistance(Math.min(distance, 100));
      }
    };

    const handleTouchEnd = () => {
      if (pullDistance > 60) {
        onRefresh?.();
      }
      setPulling(false);
      setPullDistance(0);
    };

    container.addEventListener("touchstart", handleTouchStart);
    container.addEventListener("touchmove", handleTouchMove);
    container.addEventListener("touchend", handleTouchEnd);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [pulling, pullDistance, onRefresh]);

  return (
    <div ref={containerRef} className="relative overflow-y-auto">
      {pullDistance > 0 && (
        <div
          className="flex items-center justify-center overflow-hidden transition-all"
          style={{
            height: `${pullDistance}px`,
            opacity: Math.min(pullDistance / 60, 1),
          }}
        >
          <RefreshCw
            className="w-4 h-4 text-primary"
            style={{
              transform: `rotate(${(pullDistance / 100) * 360}deg)`,
            }}
          />
        </div>
      )}
      {children}
    </div>
  );
}