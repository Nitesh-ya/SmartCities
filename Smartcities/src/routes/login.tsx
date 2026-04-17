import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/Shell";
import { setSession } from "@/lib/store";
import { AREAS, DEPARTMENTS, type Department, type Role } from "@/lib/mock-data";
import { WORKERS } from "@/lib/mock-data";
import { Camera, ShieldCheck, Wrench, Users } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login — Civic·Ops" }, { name: "description", content: "Demo login for Civic·Ops prototype." }] }),
  component: Login,
});

const ROLES: { id: Role; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: "citizen", label: "Citizen", icon: <Camera className="h-4 w-4" />, desc: "Report and track issues" },
  { id: "head", label: "Department Head", icon: <ShieldCheck className="h-4 w-4" />, desc: "Allot tasks, manage priorities" },
  { id: "worker", label: "Field Worker", icon: <Wrench className="h-4 w-4" />, desc: "Receive and resolve work" },
  { id: "admin", label: "Admin", icon: <Users className="h-4 w-4" />, desc: "City-wide oversight" },
];

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("citizen");
  const [name, setName] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [workerId, setWorkerId] = useState("W-204");
  const [password, setPassword] = useState("demo");
  const [department, setDepartment] = useState<Department>("roads");
  const [area, setArea] = useState(AREAS[0]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === "worker") {
      const w = WORKERS.find((x) => x.id === workerId) ?? WORKERS[0];
      setSession({ role: "worker", id: w.id, name: w.name, department: w.department, area: w.area });
      navigate({ to: "/worker" });
    } else if (role === "head") {
      setSession({ role: "head", id: `H-${department}`, name: `${department.toUpperCase()} Head`, department });
      navigate({ to: "/head" });
    } else if (role === "admin") {
      setSession({ role: "admin", id: "A-001", name: name || "Admin" });
      navigate({ to: "/admin" });
    } else {
      setSession({ role: "citizen", id: aadhaar || "C-DEMO", name: name || "Citizen", area });
      navigate({ to: "/citizen" });
    }
  };

  return (
    <Shell title="Sign in" subtitle="Demo mode — no real authentication. Pick a role to explore.">
      <div className="grid md:grid-cols-[280px_1fr] gap-4 max-w-4xl">
        <div className="space-y-2">
          {ROLES.map((r) => (
            <button
              key={r.id}
              onClick={() => setRole(r.id)}
              className={`w-full text-left panel p-3 transition ${role === r.id ? "border-primary/60 bg-surface-elevated" : "hover:border-primary/30"}`}
            >
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded bg-muted grid place-items-center text-primary">{r.icon}</div>
                <div>
                  <div className="text-sm font-medium">{r.label}</div>
                  <div className="label-meta mt-0.5">{r.desc}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="panel p-5 space-y-4">
          <div>
            <div className="label-meta">selected role</div>
            <div className="text-lg font-semibold mt-1 capitalize">{role}</div>
          </div>

          {role === "citizen" && (
            <>
              <Field label="Full name">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="input" />
              </Field>
              <Field label="Aadhaar number (mock)">
                <input value={aadhaar} onChange={(e) => setAadhaar(e.target.value)} placeholder="XXXX-XXXX-XXXX" className="input font-mono" />
              </Field>
              <Field label="Home area">
                <select value={area} onChange={(e) => setArea(e.target.value)} className="input">
                  {AREAS.map((a) => <option key={a}>{a}</option>)}
                </select>
              </Field>
            </>
          )}

          {role === "head" && (
            <Field label="Department">
              <select value={department} onChange={(e) => setDepartment(e.target.value as Department)} className="input">
                {DEPARTMENTS.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
              </select>
            </Field>
          )}

          {role === "worker" && (
            <>
              <Field label="Worker ID">
                <select value={workerId} onChange={(e) => setWorkerId(e.target.value)} className="input font-mono">
                  {WORKERS.map((w) => <option key={w.id} value={w.id}>{w.id} — {w.name} ({w.area})</option>)}
                </select>
              </Field>
              <Field label="Password">
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="input font-mono" />
              </Field>
            </>
          )}

          {role === "admin" && (
            <Field label="Admin name">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Admin" className="input" />
            </Field>
          )}

          <button type="submit" className="w-full bg-primary text-primary-foreground rounded font-mono text-xs uppercase tracking-widest py-3 hover:opacity-90">
            Continue →
          </button>
          <p className="label-meta text-center">demo · no credentials are verified</p>
        </form>
      </div>

      <style>{`.input { width: 100%; background: var(--color-input); border: 1px solid var(--color-border); border-radius: 6px; padding: 8px 10px; font-size: 13px; color: var(--color-foreground); outline: none; } .input:focus { border-color: var(--color-primary); }`}</style>
    </Shell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="label-meta mb-1.5">{label}</div>
      {children}
    </label>
  );
}
