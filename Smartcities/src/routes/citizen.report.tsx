import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";
import { useState } from "react";
import { DEPARTMENTS, type Department, AREAS } from "@/lib/mock-data";
import { issuesStore, useSession } from "@/lib/store";
import { Sparkles, MapPin, Loader2, Upload } from "lucide-react";

export const Route = createFileRoute("/citizen/report")({
  head: () => ({ meta: [{ title: "Report an issue — Civic·Ops" }] }),
  component: ReportIssue,
});

const EMOJI_FOR: Record<Department, string> = {
  roads: "🕳️", water: "💧", garbage: "🗑️", electricity: "💡", drainage: "🌊",
};

function ReportIssue() {
  const session = useSession();
  const navigate = useNavigate();
  const [photo, setPhoto] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [area, setArea] = useState(session?.area ?? AREAS[0]);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [aiRunning, setAiRunning] = useState(false);
  const [aiResult, setAiResult] = useState<{ dept: Department; conf: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onFile = (f: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(reader.result as string);
      // mock AI detection
      setAiRunning(true);
      setTimeout(() => {
        const guess = (["roads", "water", "garbage", "electricity", "drainage"] as Department[])[
          Math.floor(Math.random() * 5)
        ];
        const conf = 0.78 + Math.random() * 0.2;
        setAiResult({ dept: guess, conf });
        setDepartments((d) => (d.includes(guess) ? d : [...d, guess]));
        setAiRunning(false);
      }, 1100);
    };
    reader.readAsDataURL(f);
  };

  const captureGps = () => {
    // mock GPS — random within bounds; real geolocation would need permission
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => setCoords({ lat: 20 + Math.random() * 70, lng: 15 + Math.random() * 75 }),
        () => setCoords({ lat: 20 + Math.random() * 70, lng: 15 + Math.random() * 75 }),
        { timeout: 1500 },
      );
    } else {
      setCoords({ lat: 20 + Math.random() * 70, lng: 15 + Math.random() * 75 });
    }
  };

  const toggleDept = (d: Department) => {
    setDepartments((arr) => (arr.includes(d) ? arr.filter((x) => x !== d) : [...arr, d]));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!departments.length) return alert("Pick at least one category");
    setSubmitting(true);
    const id = `CIV-${Math.floor(1100 + Math.random() * 8000)}`;
    const c = coords ?? { lat: 50, lng: 50 };
    issuesStore.add({
      id,
      title: description.split("\n")[0].slice(0, 60) || "Issue reported",
      departments,
      primaryDepartment: aiResult?.dept ?? departments[0],
      status: "submitted",
      area,
      lat: c.lat,
      lng: c.lng,
      reportedBy: session?.name ?? "Citizen",
      reportedAt: new Date().toISOString(),
      beforePhoto: EMOJI_FOR[aiResult?.dept ?? departments[0]],
      priority: "medium",
      aiConfidence: aiResult?.conf ?? 0.75,
      description,
    });
    setTimeout(() => navigate({ to: "/citizen/$id", params: { id } }), 400);
  };

  return (
    <Shell title="Report an issue" subtitle="Upload a photo, pick categories, capture location. AI suggests the most likely department."
      nav={[{ to: "/citizen", label: "My reports" }, { to: "/citizen/report", label: "Report issue" }]}
    >
      <form onSubmit={submit} className="grid lg:grid-cols-[1fr_360px] gap-4 max-w-5xl">
        <div className="space-y-4">
          <div className="panel p-4">
            <div className="label-meta mb-2">photo evidence</div>
            <label className="block border border-dashed border-border rounded-lg aspect-video bg-grid grid place-items-center cursor-pointer hover:border-primary/50 transition overflow-hidden">
              {photo ? (
                <img src={photo} alt="upload" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
                  <div className="text-sm mt-2">Click to upload or take a photo</div>
                  <div className="label-meta mt-1">jpg / png · max 8mb</div>
                </div>
              )}
              <input type="file" accept="image/*" capture="environment" hidden onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
            </label>

            {(aiRunning || aiResult) && (
              <div className="mt-3 panel-elevated p-3 flex items-center gap-3">
                {aiRunning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <div className="text-sm">AI analyzing image…</div>
                  </>
                ) : aiResult && (
                  <>
                    <Sparkles className="h-4 w-4 text-accent" />
                    <div className="text-sm">
                      Detected: <span className="font-medium capitalize">{DEPARTMENTS.find((d) => d.id === aiResult.dept)?.label}</span>
                      <span className="font-mono text-xs text-muted-foreground ml-2">conf {(aiResult.conf * 100).toFixed(0)}%</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="panel p-4">
            <div className="label-meta mb-2">description</div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Briefly describe what's wrong…"
              className="w-full bg-input border border-border rounded p-3 text-sm outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="panel p-4">
            <div className="label-meta mb-2">categories (multi-select)</div>
            <div className="flex flex-wrap gap-2">
              {DEPARTMENTS.map((d) => {
                const active = departments.includes(d.id);
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => toggleDept(d.id)}
                    className={`px-3 py-1.5 rounded-full border text-xs transition ${active ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="panel p-4">
            <div className="label-meta mb-2">location</div>
            <div className="flex gap-2">
              <button type="button" onClick={captureGps} className="flex items-center gap-1.5 px-3 py-2 rounded border border-border text-xs hover:border-primary/50">
                <MapPin className="h-3.5 w-3.5" /> Capture GPS
              </button>
            </div>
            <div className="mt-3">
              <div className="label-meta mb-1.5">or pick area</div>
              <select value={area} onChange={(e) => setArea(e.target.value)} className="w-full bg-input border border-border rounded p-2 text-sm">
                {AREAS.map((a) => <option key={a}>{a}</option>)}
              </select>
            </div>
            {coords && (
              <div className="mt-3 font-mono text-xs text-muted-foreground">
                {coords.lat.toFixed(4)}°, {coords.lng.toFixed(4)}°
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting || !photo}
            className="w-full bg-primary text-primary-foreground rounded font-mono text-xs uppercase tracking-widest py-3 hover:opacity-90 disabled:opacity-40"
          >
            {submitting ? "Submitting…" : "Submit report"}
          </button>
          {!photo && <p className="label-meta text-center">photo required</p>}
        </div>
      </form>
    </Shell>
  );
}
