import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, Polyline, Polygon } from "react-leaflet";
import L from "leaflet";
import { STATUS_CONFIG } from "./StatusBadge";

// Fix default Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Build a colored circle icon per lead status
const iconCache = {};
function getLeadIcon(status, isSelected) {
  const key = `${status}-${isSelected}`;
  if (iconCache[key]) return iconCache[key];
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.not_visited;
  const size = isSelected ? 24 : 14;
  const border = isSelected ? "3px solid white" : "2px solid white";
  const shadow = isSelected ? "0 3px 12px rgba(0,0,0,0.5)" : "0 2px 5px rgba(0,0,0,0.3)";
  iconCache[key] = L.divIcon({
    className: "",
    html: `<div style="width:${size}px;height:${size}px;background:${cfg.mapColor};border:${border};border-radius:50%;box-shadow:${shadow};"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
  return iconCache[key];
}

// Auto-pan when center prop changes
function AutoCenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, zoom || map.getZoom(), { animate: true, duration: 0.5 });
  }, [center, zoom]);
  return null;
}

// Fit all leads into view on first load
function AutoFitBounds({ leads }) {
  const map = useMap();
  const fitted = useRef(false);
  useEffect(() => {
    if (leads.length > 0 && !fitted.current) {
      map.fitBounds(leads.map(l => [l.lat, l.lng]), { padding: [40, 40], maxZoom: 16, animate: true });
      fitted.current = true;
    }
  }, [leads.length]);
  // Reset when territory changes
  useEffect(() => { fitted.current = false; }, [leads]);
  return null;
}

// Blue dot for current user position
function UserMarker({ position }) {
  if (!position) return null;
  const icon = L.divIcon({
    className: "",
    html: `<div style="width:16px;height:16px;background:#2563eb;border:3px solid white;border-radius:50%;box-shadow:0 0 0 5px rgba(37,99,235,0.25);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
  return (
    <>
      <Circle center={position} radius={40} pathOptions={{ color: "#2563eb", fillOpacity: 0.06, weight: 1, dashArray: "4,4" }} />
      <Marker position={position} icon={icon}>
        <Popup closeButton={false}>📍 You are here</Popup>
      </Marker>
    </>
  );
}

export default function CanvassingMap({
  leads = [],
  center,
  zoom = 15,
  userPosition,
  onLeadClick,
  selectedLeadId,
  territories = [],
  routeLeads = [],
}) {
  return (
    <MapContainer
      center={center || [39.5, -98.35]}
      zoom={center ? zoom : 4}
      style={{ width: "100%", height: "100%" }}
      zoomControl={false}
    >
      {/* Satellite imagery */}
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        attribution="Tiles © Esri"
        maxZoom={19}
      />
      {/* Street labels on top */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
        attribution=""
        maxZoom={19}
        opacity={0.8}
      />

      {center ? (
        <AutoCenter center={center} zoom={zoom} />
      ) : (
        leads.length > 0 && <AutoFitBounds leads={leads} />
      )}

      <UserMarker position={userPosition} />

      {/* Territory outlines */}
      {territories.map((t, i) =>
        t.polygon?.length > 2 ? (
          <Polygon
            key={t.id || i}
            positions={t.polygon}
            pathOptions={{ color: t.color || "#3b82f6", fillOpacity: 0.05, weight: 2, dashArray: "6,4" }}
          />
        ) : null
      )}

      {/* Optimized route line */}
      {routeLeads.length > 1 && (
        <Polyline
          positions={routeLeads.map(l => [l.lat, l.lng])}
          pathOptions={{ color: "#7c3aed", weight: 2.5, dashArray: "8,6", opacity: 0.75 }}
        />
      )}

      {/* Lead markers */}
      {leads.map(lead => (
        <Marker
          key={lead.id}
          position={[lead.lat, lead.lng]}
          icon={getLeadIcon(lead.status, lead.id === selectedLeadId)}
          zIndexOffset={lead.id === selectedLeadId ? 1000 : 0}
          eventHandlers={{ click: () => onLeadClick?.(lead) }}
        >
          {lead.id === selectedLeadId && (
            <Popup closeButton={false} offset={[0, -8]}>
              <div style={{ minWidth: 150, padding: "2px 0" }}>
                <p style={{ fontWeight: 700, fontSize: 13, margin: "0 0 2px" }}>{lead.owner_name || "Unknown"}</p>
                <p style={{ fontSize: 11, color: "#666", margin: 0 }}>{lead.address}</p>
                {lead.lead_score != null && (
                  <p style={{ fontSize: 11, color: "#2563eb", margin: "3px 0 0", fontWeight: 600 }}>Score: {lead.lead_score}</p>
                )}
              </div>
            </Popup>
          )}
        </Marker>
      ))}
    </MapContainer>
  );
}