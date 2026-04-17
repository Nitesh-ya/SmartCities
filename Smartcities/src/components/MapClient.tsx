import { useEffect, useState } from "react";
import { type Issue } from "@/lib/mock-data";

type Props = {
  issues: Issue[];
  height?: number;
  showHeat?: boolean;
  showAreas?: boolean;
  fitToIssues?: boolean;
};

// Client-only wrapper around the Leaflet map (Leaflet touches `window`).
export function MapClient(props: Props) {
  const [Comp, setComp] = useState<React.ComponentType<Props> | null>(null);

  useEffect(() => {
    let mounted = true;
    import("./MapView").then((m) => {
      if (mounted) setComp(() => m.MapView);
    });
    return () => { mounted = false; };
  }, []);

  if (!Comp) {
    return (
      <div
        className="w-full rounded border border-border bg-surface bg-grid grid place-items-center"
        style={{ height: props.height ?? 420 }}
      >
        <div className="label-meta animate-pulse">loading map…</div>
      </div>
    );
  }
  return <Comp {...props} />;
}
