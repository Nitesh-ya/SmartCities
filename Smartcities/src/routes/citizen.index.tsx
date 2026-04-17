import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";
import { useIssues, useSession } from "@/lib/store";
import { StatusBadge, PriorityDot } from "@/components/StatusBadge";
import { Camera, Plus } from "lucide-react";
import { DEPARTMENTS } from "@/lib/mock-data";

export const Route = createFileRoute("/citizen/")({
  head: () => ({ meta: [{ title: "Citizen — My reports" }] }),
  component: CitizenHome,
});

function CitizenHome() {
  const session = useSession();
  const issues = useIssues();
  const mine = session ? issues.filter((i) => i.reportedBy === session.name || i.reportedBy.startsWith(session.name?.split(" ")[0] ?? "_")) : [];
  const display = mine.length ? mine : issues.slice(0, 3); // demo fallback

  return (
    <Shell
      title={`Welcome${session ? ", " + session.name.split(" ")[0] : ""}`}
      subtitle="Report a new issue or track the status of what you've reported."
      nav={[
        { to: "/citizen", label: "My reports" },
        { to: "/citizen/report", label: "Report issue" },
        { to: "/dashboard", label: "City stats" },
      ]}
    >
      <div className="flex flex-wrap gap-3 mb-4">
        <Link to="/citizen/report" className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded text-xs font-mono uppercase tracking-widest hover:opacity-90">
          <Plus className="h-3.5 w-3.5" /> New report
        </Link>
        <Link to="/dashboard" className="flex items-center gap-2 panel px-4 py-2.5 text-xs font-mono uppercase tracking-widest hover:border-primary/40">
          City heatmap
        </Link>
      </div>

      <div className="grid gap-3">
        {display.map((i) => (
          <Link key={i.id} to="/citizen/$id" params={{ id: i.id }} className="panel p-4 hover:border-primary/40 transition block">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded bg-muted grid place-items-center text-2xl shrink-0">{i.beforePhoto}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[10px] text-muted-foreground">{i.id}</span>
                  <PriorityDot p={i.priority} />
                  <StatusBadge status={i.status} />
                </div>
                <div className="font-medium mt-1 truncate">{i.title}</div>
                <div className="label-meta mt-1">
                  {i.area} · {i.departments.map((d) => DEPARTMENTS.find((x) => x.id === d)?.label).join(" + ")}
                </div>
              </div>
              {i.afterPhoto && <div className="h-14 w-14 rounded bg-success/10 border border-success/30 grid place-items-center text-2xl shrink-0">{i.afterPhoto}</div>}
            </div>
          </Link>
        ))}
        {display.length === 0 && (
          <div className="panel p-10 text-center">
            <Camera className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="text-sm mt-3">No reports yet. Create your first one.</p>
          </div>
        )}
      </div>
    </Shell>
  );
}
