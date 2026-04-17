import { Link, useNavigate } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { setSession, useSession } from "@/lib/store";
import { Activity, LogOut } from "lucide-react";

export function Shell({ children, title, subtitle, nav }: {
  children: ReactNode;
  title: string;
  subtitle?: string;
  nav?: { to: string; label: string }[];
}) {
  const session = useSession();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border bg-surface/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="h-7 w-7 rounded-md bg-primary/15 border border-primary/30 grid place-items-center">
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <div className="font-mono text-xs tracking-widest text-foreground">CIVIC<span className="text-primary">·</span>OPS</div>
          </Link>
          <div className="hidden md:flex items-center gap-1 ml-4">
            {nav?.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="px-2.5 py-1 rounded text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-muted transition"
                activeProps={{ className: "px-2.5 py-1 rounded text-xs font-mono uppercase tracking-wider text-foreground bg-muted" }}
              >
                {n.label}
              </Link>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Link to="/dashboard" className="hidden sm:block label-meta hover:text-foreground">Public Dashboard</Link>
            {session ? (
              <div className="flex items-center gap-2">
                <div className="text-right leading-tight">
                  <div className="text-xs font-medium">{session.name}</div>
                  <div className="label-meta">{session.role}{session.area ? ` · ${session.area}` : ""}</div>
                </div>
                <button
                  onClick={() => { setSession(null); navigate({ to: "/login" }); }}
                  className="h-8 w-8 grid place-items-center rounded border border-border hover:bg-muted"
                  aria-label="Logout"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="text-xs font-mono uppercase tracking-wider px-3 py-1.5 rounded bg-primary text-primary-foreground hover:opacity-90">
                Login
              </Link>
            )}
          </div>
        </div>
      </header>
      <div className="border-b border-border bg-grid">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
          <div className="label-meta">civic operations console</div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mt-1">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{subtitle}</p>}
        </div>
      </div>
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 py-6">{children}</main>
      <footer className="border-t border-border">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between label-meta">
          <span>civic·ops · prototype</span>
          <span>v0.1 · demo data</span>
        </div>
      </footer>
    </div>
  );
}
