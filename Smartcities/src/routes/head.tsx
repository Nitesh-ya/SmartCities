import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";
import { useIssues, useSession, issuesStore } from "@/lib/store";
import { DEPARTMENTS, WORKERS, AREAS, type Department } from "@/lib/mock-data";
import { StatusBadge, PriorityDot } from "@/components/StatusBadge";
import { useState } from "react";
import { ArrowRight, Layers } from "lucide-react";

export const Route = createFileRoute("/head")({
  head: () => ({ meta: [{ title: "Department Head — Civic·Ops" }] }),
  component: HeadDashboard,
});

function HeadDashboard() {
  const session = useSession();
  const issues = useIssues();
  const [filterArea, setFilterArea] = useState<string>("all");
  const [tab, setTab] = useState<"queue" | "cross">("queue");

  const dept = (session?.department ?? "roads") as Department;
  const departmentIssues = issues.filter((i) => i.departments.includes(dept));
  const filtered = filterArea === "all" ? departmentIssues : departmentIssues.filter((i) => i.area === filterArea);
  const queue = filtered.filter((i) => i.status === "submitted" || i.status === "received");
  const active = filtered.filter((i) => i.status === "assigned" || i.status === "in_progress");

  const cross = issues.filter((i) => i.departments.length > 1);

  const myWorkers = WORKERS.filter((w) => w.department === dept);

  const allot = (issueId: string, workerId: string) => {
    issuesStore.update(issueId, { assignedTo: workerId, status: "assigned" });
  };

  return (
    <Shell
      title={`${DEPARTMENTS.find((d) => d.id === dept)?.label} · Head`}
      subtitle="Allot incoming issues to workers in your area. Resolve cross-department cases by priority."
      nav={[
        { to: "/head", label: "My queue" },
        { to: "/dashboard", label: "City stats" },
      ]}
    >
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex gap-1 panel p-1">
          <button onClick={() => setTab("queue")} className={`px-3 py-1.5 rounded text-xs font-mono uppercase tracking-wider ${tab === "queue" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>Queue ({queue.length})</button>
          <button onClick={() => setTab("cross")} className={`px-3 py-1.5 rounded text-xs font-mono uppercase tracking-wider ${tab === "cross" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>Cross-dept ({cross.length})</button>
        </div>
        <select value={filterArea} onChange={(e) => setFilterArea(e.target.value)} className="bg-input border border-border rounded px-3 py-1.5 text-xs">
          <option value="all">All areas</option>
          {AREAS.map((a) => <option key={a}>{a}</option>)}
        </select>
      </div>

      {tab === "queue" ? (
        <div className="grid lg:grid-cols-2 gap-4">
          <Section title="Inbox · awaiting allotment" empty="Inbox empty">
            {queue.map((i) => (
              <div key={i.id} className="panel p-3">
                <Row issue={i} />
                <div className="mt-3 flex flex-wrap gap-2 items-center">
                  <span className="label-meta">allot to:</span>
                  {myWorkers.map((w) => (
                    <button key={w.id} onClick={() => allot(i.id, w.id)} className="text-xs px-2 py-1 rounded border border-border hover:border-primary/50 hover:bg-primary/10">
                      {w.id} · {w.area}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </Section>
          <Section title="In progress" empty="Nothing in progress">
            {active.map((i) => (
              <div key={i.id} className="panel p-3">
                <Row issue={i} />
                <div className="mt-2 label-meta">worker {i.assignedTo}</div>
              </div>
            ))}
          </Section>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="panel p-4">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-accent" />
              <div className="font-medium text-sm">Cross-department coordination</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Issues spanning multiple departments. They are resolved one-by-one in order of priority.</p>
          </div>
          {cross
            .sort((a, b) => (a.priority === "high" ? -1 : 1))
            .map((i, idx) => (
              <div key={i.id} className="panel p-3">
                <div className="flex items-start gap-3">
                  <div className="font-mono text-xs text-muted-foreground w-6">#{idx + 1}</div>
                  <div className="flex-1">
                    <Row issue={i} />
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {i.departments.map((d, k) => (
                        <span key={d} className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider">
                          <span className="px-2 py-0.5 rounded border border-border bg-muted">{DEPARTMENTS.find((x) => x.id === d)?.label}</span>
                          {k < i.departments.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </Shell>
  );
}

function Section({ title, empty, children }: { title: string; empty: string; children: React.ReactNode }) {
  const arr = Array.isArray(children) ? children : [children];
  return (
    <div>
      <div className="label-meta mb-2">{title}</div>
      <div className="space-y-2">
        {arr.length === 0 ? <div className="panel p-6 text-center text-sm text-muted-foreground">{empty}</div> : children}
      </div>
    </div>
  );
}

function Row({ issue }: { issue: ReturnType<typeof useIssues>[number] }) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-10 w-10 rounded bg-muted grid place-items-center text-xl shrink-0">{issue.beforePhoto}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-[10px] text-muted-foreground">{issue.id}</span>
          <PriorityDot p={issue.priority} />
          <StatusBadge status={issue.status} />
        </div>
        <div className="text-sm font-medium mt-0.5 truncate">{issue.title}</div>
        <div className="label-meta">{issue.area}</div>
      </div>
    </div>
  );
}
