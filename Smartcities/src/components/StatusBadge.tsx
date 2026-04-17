import { type IssueStatus, STATUS_LABEL } from "@/lib/mock-data";

const styles: Record<IssueStatus, string> = {
  submitted: "bg-muted text-muted-foreground border-border",
  received: "bg-info/15 text-info border-info/30",
  assigned: "bg-info/15 text-info border-info/30",
  in_progress: "bg-warning/15 text-warning border-warning/30",
  resolved: "bg-success/15 text-success border-success/30",
  verified: "bg-success/25 text-success border-success/50",
};

export function StatusBadge({ status }: { status: IssueStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-mono uppercase tracking-wider ${styles[status]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {STATUS_LABEL[status]}
    </span>
  );
}

export function PriorityDot({ p }: { p: "low" | "medium" | "high" }) {
  const c = p === "high" ? "bg-destructive" : p === "medium" ? "bg-warning" : "bg-muted-foreground";
  return <span className={`h-2 w-2 rounded-full ${c}`} aria-label={`priority ${p}`} />;
}
