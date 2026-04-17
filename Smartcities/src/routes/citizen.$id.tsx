import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";
import { useIssues, issuesStore } from "@/lib/store";
import { STATUS_LABEL, STATUS_ORDER, DEPARTMENTS, type IssueStatus } from "@/lib/mock-data";
import { StatusBadge, PriorityDot } from "@/components/StatusBadge";
import { Check, X, MapPin, Sparkles } from "lucide-react";

export const Route = createFileRoute("/citizen/$id")({
  head: ({ params }) => ({ meta: [{ title: `${params.id} — Track issue` }] }),
  component: TrackIssue,
  notFoundComponent: () => (
    <Shell title="Issue not found"><Link to="/citizen" className="text-primary text-sm">← Back</Link></Shell>
  ),
});

function TrackIssue() {
  const { id } = Route.useParams();
  const issues = useIssues();
  const issue = issues.find((i) => i.id === id);
  if (!issue) throw notFound();

  const verify = (ok: boolean) => {
    issuesStore.update(issue.id, { citizenVerified: ok, status: ok ? "verified" : "in_progress" });
  };

  return (
    <Shell title={issue.title} subtitle={`${issue.id} · reported ${new Date(issue.reportedAt).toLocaleString()}`}
      nav={[{ to: "/citizen", label: "My reports" }, { to: "/citizen/report", label: "Report issue" }]}
    >
      <div className="grid lg:grid-cols-[1fr_320px] gap-4">
        <div className="space-y-4">
          <div className="panel p-4">
            <div className="flex items-center gap-2 flex-wrap">
              <PriorityDot p={issue.priority} />
              <StatusBadge status={issue.status} />
              <span className="label-meta ml-auto"><MapPin className="h-3 w-3 inline mr-1" />{issue.area}</span>
            </div>
            <p className="text-sm mt-3">{issue.description}</p>
            <div className="flex gap-2 mt-3 flex-wrap">
              {issue.departments.map((d) => (
                <span key={d} className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border border-border bg-muted">
                  {DEPARTMENTS.find((x) => x.id === d)?.label}
                </span>
              ))}
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border border-accent/30 bg-accent/10 text-accent inline-flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> ai {(issue.aiConfidence * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          <div className="panel p-4">
            <div className="label-meta mb-3">progress timeline</div>
            <ol className="space-y-3">
              {STATUS_ORDER.map((s, idx) => {
                const reached = STATUS_ORDER.indexOf(issue.status) >= idx;
                const current = issue.status === s;
                return (
                  <li key={s} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`h-6 w-6 rounded-full grid place-items-center text-[10px] font-mono ${reached ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground border border-border"}`}>
                        {idx + 1}
                      </div>
                      {idx < STATUS_ORDER.length - 1 && (
                        <div className={`w-0.5 flex-1 ${reached ? "bg-primary/50" : "bg-border"}`} style={{ minHeight: 24 }} />
                      )}
                    </div>
                    <div className="pb-3">
                      <div className={`text-sm ${current ? "font-semibold text-foreground" : reached ? "text-foreground" : "text-muted-foreground"}`}>
                        {STATUS_LABEL[s as IssueStatus]}
                      </div>
                      {s === "submitted" && reached && <div className="label-meta mt-0.5">photo received · ai classified</div>}
                      {s === "received" && reached && <div className="label-meta mt-0.5">routed to {DEPARTMENTS.find((d) => d.id === issue.primaryDepartment)?.label}</div>}
                      {s === "assigned" && reached && issue.assignedTo && <div className="label-meta mt-0.5">worker {issue.assignedTo}</div>}
                      {s === "resolved" && reached && issue.afterPhoto && <div className="label-meta mt-0.5">field worker uploaded after-photo</div>}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {issue.status === "resolved" && issue.citizenVerified === undefined && (
            <div className="panel-elevated p-4 border-warning/40">
              <div className="font-medium text-sm">Was this issue actually resolved?</div>
              <p className="text-xs text-muted-foreground mt-1">Optional confirmation. You may attach a photo, but it's not required.</p>
              <div className="flex gap-2 mt-3">
                <button onClick={() => verify(true)} className="flex items-center gap-1.5 px-4 py-2 rounded bg-success text-success-foreground text-xs font-mono uppercase tracking-wider hover:opacity-90">
                  <Check className="h-3.5 w-3.5" /> Yes, resolved
                </button>
                <button onClick={() => verify(false)} className="flex items-center gap-1.5 px-4 py-2 rounded bg-destructive text-destructive-foreground text-xs font-mono uppercase tracking-wider hover:opacity-90">
                  <X className="h-3.5 w-3.5" /> No, not yet
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="panel p-4">
            <div className="label-meta mb-2">before</div>
            <div className="aspect-square rounded bg-muted grid place-items-center text-6xl">{issue.beforePhoto}</div>
          </div>
          <div className="panel p-4">
            <div className="label-meta mb-2">after</div>
            <div className="aspect-square rounded bg-muted grid place-items-center text-6xl">
              {issue.afterPhoto ?? <span className="text-xs text-muted-foreground font-mono">awaiting</span>}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
