import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";
import { useIssues } from "@/lib/store";
import { DEPARTMENTS, AREAS } from "@/lib/mock-data";
import { MapClient } from "@/components/MapClient";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "City Dashboard — Civic·Ops" },
      { name: "description", content: "Public dashboard: resolution rate by department and live heatmap of civic issues." },
    ],
  }),
  component: PublicDashboard,
});

function PublicDashboard() {
  const issues = useIssues();
  const total = issues.length;
  const resolved = issues.filter((i) => i.status === "resolved" || i.status === "verified").length;
  const pct = total ? Math.round((resolved / total) * 100) : 0;

  const byDept = DEPARTMENTS.map((d) => {
    const arr = issues.filter((i) => i.departments.includes(d.id));
    const r = arr.filter((i) => i.status === "resolved" || i.status === "verified").length;
    return { ...d, total: arr.length, resolved: r, pct: arr.length ? Math.round((r / arr.length) * 100) : 0 };
  });

  const byArea = AREAS.map((a) => ({
    area: a,
    open: issues.filter((i) => i.area === a && i.status !== "resolved" && i.status !== "verified").length,
  }));

  return (
    <Shell
      title="City Dashboard"
      subtitle="A public view of how your city is performing on civic issues."
      nav={[{ to: "/dashboard", label: "City stats" }, { to: "/citizen/report", label: "Report issue" }]}
    >
      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-4">
        <div className="space-y-4">
          <div className="panel p-6 relative overflow-hidden">
            <div className="label-meta">overall resolution rate</div>
            <div className="flex items-end gap-4 mt-2">
              <div className="stat-num text-7xl text-primary">{pct}%</div>
              <div className="pb-3">
                <div className="text-sm">{resolved} resolved of {total}</div>
                <div className="label-meta">across {DEPARTMENTS.length} departments</div>
              </div>
            </div>
            <div className="mt-4 h-3 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-success" style={{ width: `${pct}%` }} />
            </div>
          </div>

          <div className="panel p-4">
            <div className="label-meta mb-3">heatmap · open issues</div>
            <MapClient issues={issues.filter((i) => i.status !== "verified")} height={380} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="panel p-4">
            <div className="label-meta mb-3">by department</div>
            <div className="space-y-3">
              {byDept.map((d) => (
                <div key={d.id}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>{d.label}</span>
                    <span className="font-mono text-muted-foreground">{d.pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full" style={{ width: `${d.pct}%`, background: d.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="panel p-4">
            <div className="label-meta mb-3">open by area</div>
            <div className="space-y-2">
              {byArea.map((a) => (
                <div key={a.area} className="flex items-center justify-between text-xs">
                  <span>{a.area}</span>
                  <span className="font-mono text-muted-foreground">{a.open} open</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
