import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";
import { useIssues } from "@/lib/store";
import { MapClient } from "@/components/MapClient";
import { ArrowRight, Camera, MapPin, Users, Wrench, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Civic·Ops — Citizen issue reporting & civic operations console" },
      { name: "description", content: "Report civic issues with photos, GPS, and AI-assisted classification. Operations dashboards for departments, heads, and field workers." },
    ],
  }),
  component: Index,
});

function Index() {
  const issues = useIssues();
  const open = issues.filter((i) => i.status !== "verified" && i.status !== "resolved").length;
  const resolved = issues.filter((i) => i.status === "resolved" || i.status === "verified").length;
  const rate = Math.round((resolved / issues.length) * 100);

  return (
    <Shell
      title="Report. Route. Resolve."
      subtitle="A civic operations console connecting citizens, department heads, and field workers — with AI-assisted issue triage and live heatmaps."
    >
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="grid sm:grid-cols-3 gap-3">
            <Stat label="Open issues" value={open.toString()} accent="text-warning" />
            <Stat label="Resolved" value={resolved.toString()} accent="text-success" />
            <Stat label="Resolution rate" value={`${rate}%`} accent="text-primary" />
          </div>

          <div className="panel p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="label-meta">live heatmap</div>
              <Link to="/dashboard" className="text-xs text-primary hover:underline">Open dashboard →</Link>
            </div>
            <MapClient issues={issues} height={320} />
          </div>
        </div>

        <div className="space-y-3">
          <RoleCard
            to="/citizen"
            icon={<Camera className="h-4 w-4" />}
            title="Citizen"
            desc="Report issues with photos, GPS, and category — track until resolved."
          />
          <RoleCard
            to="/head"
            icon={<ShieldCheck className="h-4 w-4" />}
            title="Department Head"
            desc="Allot work to your team, prioritize cross-department cases."
          />
          <RoleCard
            to="/worker"
            icon={<Wrench className="h-4 w-4" />}
            title="Field Worker"
            desc="Receive assignments and post before/after evidence."
          />
          <RoleCard
            to="/admin"
            icon={<Users className="h-4 w-4" />}
            title="Admin"
            desc="City-wide KPIs, departmental load and resolution metrics."
          />
          <Link to="/login" className="block panel p-4 hover:border-primary/50 transition group">
            <div className="flex items-center justify-between">
              <div>
                <div className="label-meta">get started</div>
                <div className="text-sm font-medium mt-1">Demo login →</div>
              </div>
              <MapPin className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
            </div>
          </Link>
        </div>
      </div>
    </Shell>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="panel p-4">
      <div className="label-meta">{label}</div>
      <div className={`stat-num text-3xl mt-2 ${accent}`}>{value}</div>
    </div>
  );
}

function RoleCard({ to, icon, title, desc }: { to: string; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <Link to={to} className="block panel p-4 hover:border-primary/50 transition group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded bg-muted grid place-items-center text-primary">{icon}</div>
          <div className="font-medium text-sm">{title}</div>
        </div>
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
      </div>
      <p className="text-xs text-muted-foreground mt-2">{desc}</p>
    </Link>
  );
}
