import { useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, Polygon, useMap, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import { type Issue, AREAS, DEPARTMENTS } from "@/lib/mock-data";
import { Link } from "@tanstack/react-router";
import { StatusBadge, PriorityDot } from "./StatusBadge";

// City bbox (Bengaluru-ish). The mock data uses 0-100 coords; we project them.
const CITY_CENTER: [number, number] = [12.9716, 77.5946];
const BBOX = {
  minLat: 12.92,
  maxLat: 13.04,
  minLng: 77.52,
  maxLng: 77.66,
};

function project(lat0to100: number, lng0to100: number): [number, number] {
  // mock "lat" was 0..100 from top, "lng" 0..100 from left → flip lat
  const lat = BBOX.minLat + ((100 - lat0to100) / 100) * (BBOX.maxLat - BBOX.minLat);
  const lng = BBOX.minLng + (lng0to100 / 100) * (BBOX.maxLng - BBOX.minLng);
  return [lat, lng];
}

// Pseudo-random but stable polygon per area
function areaPolygon(area: string): [number, number][] {
  const idx = AREAS.indexOf(area);
  const cols = 3;
  const w = (BBOX.maxLng - BBOX.minLng) / cols;
  const h = (BBOX.maxLat - BBOX.minLat) / 2;
  const cx = BBOX.minLng + (idx % cols) * w + w / 2;
  const cy = BBOX.maxLat - Math.floor(idx / cols) * h - h / 2;
  // irregular hexagon-ish polygon
  const seed = idx * 13.37;
  const pts: [number, number][] = [];
  const sides = 6;
  for (let i = 0; i < sides; i++) {
    const a = (i / sides) * Math.PI * 2 + seed;
    const r = 0.018 + ((Math.sin(seed + i) + 1) / 2) * 0.008;
    pts.push([cy + Math.sin(a) * r * 0.8, cx + Math.cos(a) * r]);
  }
  return pts;
}

const PRIORITY_COLOR: Record<Issue["priority"], string> = {
  high: "oklch(0.65 0.22 25)",
  medium: "oklch(0.82 0.17 75)",
  low: "oklch(0.78 0.16 200)",
};

function HeatLayer({ issues }: { issues: Issue[] }) {
  const map = useMap();
  const layerRef = useRef<L.Layer | null>(null);

  useEffect(() => {
    const points = issues.map((i) => {
      const [lat, lng] = project(i.lat, i.lng);
      const intensity = i.priority === "high" ? 1 : i.priority === "medium" ? 0.6 : 0.35;
      return [lat, lng, intensity] as [number, number, number];
    });

    // @ts-expect-error - leaflet.heat extends L
    const layer = L.heatLayer(points, {
      radius: 30,
      blur: 22,
      maxZoom: 17,
      minOpacity: 0.35,
      gradient: {
        0.0: "rgba(120,210,255,0)",
        0.3: "oklch(0.78 0.16 200)",
        0.55: "oklch(0.82 0.17 75)",
        0.85: "oklch(0.65 0.22 25)",
      },
    });
    layer.addTo(map);
    layerRef.current = layer;
    return () => {
      if (layerRef.current) map.removeLayer(layerRef.current);
    };
  }, [issues, map]);

  return null;
}

export function MapView({
  issues,
  height = 420,
  showHeat = true,
  showAreas = true,
  fitToIssues = false,
}: {
  issues: Issue[];
  height?: number;
  showHeat?: boolean;
  showAreas?: boolean;
  fitToIssues?: boolean;
}) {
  const projected = useMemo(
    () => issues.map((i) => ({ issue: i, pos: project(i.lat, i.lng) })),
    [issues],
  );

  return (
    <div className="relative w-full overflow-hidden rounded border border-border" style={{ height }}>
      <MapContainer
        center={CITY_CENTER}
        zoom={13}
        zoomControl={false}
        scrollWheelZoom
        style={{ height: "100%", width: "100%", background: "oklch(0.18 0.02 250)" }}
      >
        <ZoomControl position="bottomright" />
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a> · <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {showAreas &&
          AREAS.map((a) => (
            <Polygon
              key={a}
              positions={areaPolygon(a)}
              pathOptions={{
                color: "oklch(0.78 0.16 200)",
                weight: 1,
                fillColor: "oklch(0.78 0.16 200)",
                fillOpacity: 0.05,
                dashArray: "4 4",
              }}
            >
              <Popup>
                <div className="font-mono text-xs uppercase tracking-wider opacity-60">area</div>
                <div className="font-medium">{a}</div>
              </Popup>
            </Polygon>
          ))}

        {showHeat && <HeatLayer issues={issues} />}

        {projected.map(({ issue, pos }) => (
          <CircleMarker
            key={issue.id}
            center={pos}
            radius={issue.priority === "high" ? 8 : issue.priority === "medium" ? 6 : 5}
            pathOptions={{
              color: "oklch(0.18 0.02 250)",
              weight: 2,
              fillColor: PRIORITY_COLOR[issue.priority],
              fillOpacity: 0.95,
            }}
          >
            <Popup>
              <div style={{ minWidth: 220 }}>
                <div className="flex items-center gap-2 mb-1">
                  <PriorityDot p={issue.priority} />
                  <span className="font-mono text-[10px] opacity-60">{issue.id}</span>
                </div>
                <div className="font-medium text-sm">{issue.title}</div>
                <div className="text-xs opacity-70 mt-0.5">
                  {issue.area} · {DEPARTMENTS.find((d) => d.id === issue.primaryDepartment)?.label}
                </div>
                <div className="my-2">
                  <StatusBadge status={issue.status} />
                </div>
                <Link
                  to="/citizen/$id"
                  params={{ id: issue.id }}
                  className="text-xs font-mono uppercase tracking-wider text-primary hover:underline"
                >
                  Open issue →
                </Link>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {fitToIssues && projected.length > 0 && <FitBounds points={projected.map((p) => p.pos)} />}
      </MapContainer>

      {/* Legend overlay */}
      <div className="absolute top-2 left-2 z-[400] panel-elevated px-3 py-2 flex items-center gap-3 text-[10px] font-mono uppercase tracking-wider">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-destructive" /> high</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-warning" /> med</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-info" /> low</span>
      </div>
    </div>
  );
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (!points.length) return;
    const bounds = L.latLngBounds(points.map((p) => L.latLng(p[0], p[1])));
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [points, map]);
  return null;
}
