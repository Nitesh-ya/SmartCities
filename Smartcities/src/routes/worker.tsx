import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";
import { useIssues, useSession, issuesStore } from "@/lib/store";
import { StatusBadge, PriorityDot } from "@/components/StatusBadge";
import { Camera, CheckCircle2, PlayCircle } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/worker")({
  head: () => ({ meta: [{ title: "Worker — Civic·Ops" }] }),
  component: WorkerDashboard,
});

function WorkerDashboard() {
  const session = useSession();
  const issues = useIssues();
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);

  const mine = issues.filter((i) => i.assignedTo === session?.id);
  const todo = mine.filter((i) => i.status === "assigned");
  const inProg = mine.filter((i) => i.status === "in_progress");
  const done = mine.filter((i) => i.status === "resolved" || i.status === "verified");

  const start = (id: string) => issuesStore.update(id, { status: "in_progress" });
  const complete = (id: string) => issuesStore.update(id, { status: "resolved", afterPhoto: "✅" });

  return (
    <Shell
      title={`Field Worker · ${session?.id ?? ""}`}
      subtitle={session ? `Area: ${session.area} · Department: ${session.department}` : "Your assignments"}
      nav={[{ to: "/worker", label: "My work" }]}
    >
      <div className="grid sm:grid-cols-3 gap-3 mb-4">
        <Stat label="To do" value={todo.length} c="text-info" />
        <Stat label="In progress" value={inProg.length} c="text-warning" />
        <Stat label="Completed" value={done.length} c="text-success" />
      </div>

      <div className="space-y-3">
        {[...todo, ...inProg, ...done].map((i) => (
          <div key={i.id} className="panel p-4">
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded bg-muted grid place-items-center text-2xl shrink-0">{i.beforePhoto}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[10px] text-muted-foreground">{i.id}</span>
                  <PriorityDot p={i.priority} />
                  <StatusBadge status={i.status} />
                </div>
                <div className="text-sm font-medium mt-1">{i.title}</div>
                <div className="label-meta mt-0.5">{i.area}</div>
                <p className="text-xs text-muted-foreground mt-2">{i.description}</p>
              </div>
              {i.afterPhoto && <div className="h-12 w-12 rounded bg-success/10 border border-success/30 grid place-items-center text-2xl shrink-0">{i.afterPhoto}</div>}
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              {i.status === "assigned" && (
                <button onClick={() => start(i.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-warning text-warning-foreground text-xs font-mono uppercase tracking-wider">
                  <PlayCircle className="h-3.5 w-3.5" /> Start work
                </button>
              )}
              {(i.status === "assigned" || i.status === "in_progress") && (
                <>
                  <button onClick={() => setUploadingFor(uploadingFor === i.id + "-before" ? null : i.id + "-before")} className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-border text-xs font-mono uppercase tracking-wider hover:border-primary/40">
                    <Camera className="h-3.5 w-3.5" /> Upload before
                  </button>
                  <button onClick={() => complete(i.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-success text-success-foreground text-xs font-mono uppercase tracking-wider">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Mark resolved + after photo
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
        {mine.length === 0 && (
          <div className="panel p-10 text-center text-sm text-muted-foreground">
            No assignments yet. Check back when your head allots work.
          </div>
        )}
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
