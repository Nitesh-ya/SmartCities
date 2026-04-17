import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";
import { useIssues } from "@/lib/store";
import { DEPARTMENTS } from "@/lib/mock-data";
import { MapClient } from "@/components/MapClient";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Civic·Ops" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const issues = useIssues();
  const total = issues.length;
  const resolved = issues.filter((i) => i.status === "resolved" || i.status === "verified").length;
  const verified = issues.filter((i) => i.status === "verified").length;
  const open = total - resolved;

  const byDept = DEPARTMENTS.map((d) => {
    const arr = issues.filter((i) => i.departments.includes(d.id));
    const r = arr.filter((i) => i.status === "resolved" || i.status === "verified").length;
    return { ...d, total: arr.length, resolved: r, pct: arr.length ? Math.round((r / arr.length) * 100) : 0 };
  });

  return (
    <Shell
      title="City Operations · Admin"
      subtitle="City-wide visibility across departments, areas and priorities."
      nav={[{ to: "/admin", label: "Overview" }, { to: "/dashboard", label: "Public stats" }]}
    >
      <div className="grid sm:grid-cols-4 gap-3 mb-4">
        <Stat label="Total reports" value={total} c="text-foreground" />
        <Stat label="Open" value={open} c="text-warning" />
        <Stat label="Resolved" value={resolved} c="text-success" />
        <Stat label="Citizen-verified" value={verified} c="text-primary" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 panel p-4">
          <div className="label-meta mb-3">live heatmap · all departments</div>
          <MapClient issues={issues} height={420} fitToIssues />
        </div>
        <div className="panel p-4">
          <div className="label-meta mb-3">department resolution</div>
          <div className="space-y-3">
            {byDept.map((d) => (
              <div key={d.id}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span>{d.label}</span>
                  <span className="font-mono text-muted-foreground">{d.resolved}/{d.total} · {d.pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full" style={{ width: `${d.pct}%`, background: d.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}

function Stat({ label, value, c }: { label: string; value: number; c: string }) {
  return (
    <div className="panel p-4">
      <div className="label-meta">{label}</div>
      <div className={`stat-num text-3xl mt-1 ${c}`}>{value}</div>
    </div>
  );
}
