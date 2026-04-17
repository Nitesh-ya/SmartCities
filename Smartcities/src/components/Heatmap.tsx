import { type Issue } from "@/lib/mock-data";

// Stylized 100x100 city grid with heat blobs from issue density
export function Heatmap({ issues, height = 360 }: { issues: Issue[]; height?: number }) {
  return (
    <div className="relative w-full overflow-hidden rounded border border-border bg-surface" style={{ height }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
        <defs>
          {/* heat gradient */}
          <radialGradient id="heat" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="oklch(0.7 0.25 25)" stopOpacity="0.85" />
            <stop offset="40%" stopColor="oklch(0.78 0.2 60)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="oklch(0.78 0.16 200)" stopOpacity="0" />
          </radialGradient>
          <pattern id="grid" width="5" height="5" patternUnits="userSpaceOnUse">
            <path d="M 5 0 L 0 0 0 5" fill="none" stroke="oklch(0.32 0.025 250)" strokeWidth="0.15" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#grid)" />
        {/* fake roads */}
        <path d="M0 30 L100 30 M0 70 L100 70 M30 0 L30 100 M70 0 L70 100" stroke="oklch(0.3 0.025 250)" strokeWidth="0.6" />
        {issues.map((i) => (
          <circle key={i.id} cx={i.lng} cy={i.lat} r={i.priority === "high" ? 9 : i.priority === "medium" ? 6 : 4} fill="url(#heat)" />
        ))}
        {issues.map((i) => (
          <circle key={`d-${i.id}`} cx={i.lng} cy={i.lat} r={0.8} fill="oklch(0.98 0 0)" />
        ))}
      </svg>
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between label-meta">
        <span>heat · density of open issues</span>
        <span>{issues.length} pts</span>
      </div>
    </div>
  );
}
