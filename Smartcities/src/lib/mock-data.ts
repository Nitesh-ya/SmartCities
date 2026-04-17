export type Department = "roads" | "water" | "garbage" | "electricity" | "drainage";
export type IssueStatus = "submitted" | "received" | "assigned" | "in_progress" | "resolved" | "verified";
export type Role = "citizen" | "head" | "worker" | "admin";

export const DEPARTMENTS: { id: Department; label: string; color: string }[] = [
  { id: "roads", label: "Roads & Potholes", color: "var(--chart-2)" },
  { id: "water", label: "Water Supply", color: "var(--chart-1)" },
  { id: "garbage", label: "Garbage & Sanitation", color: "var(--chart-3)" },
  { id: "electricity", label: "Electricity", color: "var(--chart-4)" },
  { id: "drainage", label: "Drainage", color: "var(--chart-5)" },
];

export const AREAS = ["Sector 7", "Sector 12", "MG Road", "Old Town", "Lakeview", "Industrial Belt"];

export type Issue = {
  id: string;
  title: string;
  departments: Department[]; // multi-choice
  primaryDepartment: Department;
  status: IssueStatus;
  area: string;
  lat: number; // 0-100 grid coords for our stylized map
  lng: number;
  reportedBy: string;
  reportedAt: string;
  assignedTo?: string;
  beforePhoto: string;
  afterPhoto?: string;
  citizenVerified?: boolean;
  priority: "low" | "medium" | "high";
  aiConfidence: number;
  description: string;
};

const now = Date.now();
const ago = (h: number) => new Date(now - h * 3600_000).toISOString();

export const MOCK_ISSUES: Issue[] = [
  { id: "CIV-1042", title: "Large pothole near bus stop", departments: ["roads"], primaryDepartment: "roads", status: "in_progress", area: "MG Road", lat: 42, lng: 38, reportedBy: "Aarav S.", reportedAt: ago(72), assignedTo: "W-204", beforePhoto: "🕳️", priority: "high", aiConfidence: 0.94, description: "Crater forming after recent rains, ~1m wide." },
  { id: "CIV-1043", title: "Overflowing garbage bin", departments: ["garbage"], primaryDepartment: "garbage", status: "resolved", area: "Sector 7", lat: 28, lng: 62, reportedBy: "Priya K.", reportedAt: ago(120), assignedTo: "W-118", beforePhoto: "🗑️", afterPhoto: "✨", citizenVerified: true, priority: "medium", aiConfidence: 0.88, description: "Bin not cleared for 4 days." },
  { id: "CIV-1044", title: "Burst pipe + road damage", departments: ["water", "roads"], primaryDepartment: "water", status: "assigned", area: "Old Town", lat: 65, lng: 22, reportedBy: "Rahul M.", reportedAt: ago(18), assignedTo: "W-302", beforePhoto: "💧", priority: "high", aiConfidence: 0.91, description: "Water leak eroding road surface." },
  { id: "CIV-1045", title: "Streetlight out", departments: ["electricity"], primaryDepartment: "electricity", status: "received", area: "Lakeview", lat: 78, lng: 71, reportedBy: "Meera J.", reportedAt: ago(8), beforePhoto: "💡", priority: "low", aiConfidence: 0.82, description: "Three lights dark on the lake promenade." },
  { id: "CIV-1046", title: "Choked drain", departments: ["drainage", "garbage"], primaryDepartment: "drainage", status: "submitted", area: "Industrial Belt", lat: 18, lng: 18, reportedBy: "Vikram R.", reportedAt: ago(2), beforePhoto: "🌊", priority: "medium", aiConfidence: 0.86, description: "Drain blocked with debris and waste." },
  { id: "CIV-1047", title: "Pothole cluster", departments: ["roads"], primaryDepartment: "roads", status: "verified", area: "Sector 12", lat: 52, lng: 84, reportedBy: "Sana T.", reportedAt: ago(240), assignedTo: "W-204", beforePhoto: "🛣️", afterPhoto: "✅", citizenVerified: true, priority: "high", aiConfidence: 0.96, description: "Series of 4 potholes on main road." },
  { id: "CIV-1048", title: "Water shortage", departments: ["water"], primaryDepartment: "water", status: "in_progress", area: "Sector 7", lat: 32, lng: 55, reportedBy: "Aarav S.", reportedAt: ago(36), assignedTo: "W-302", beforePhoto: "🚰", priority: "high", aiConfidence: 0.79, description: "No supply for 36 hours." },
  { id: "CIV-1049", title: "Garbage dump on roadside", departments: ["garbage", "roads"], primaryDepartment: "garbage", status: "resolved", area: "MG Road", lat: 45, lng: 41, reportedBy: "Priya K.", reportedAt: ago(96), assignedTo: "W-118", beforePhoto: "🚮", afterPhoto: "🧹", citizenVerified: false, priority: "medium", aiConfidence: 0.9, description: "Illegal dumping on shoulder." },
  { id: "CIV-1050", title: "Transformer sparking", departments: ["electricity"], primaryDepartment: "electricity", status: "verified", area: "Old Town", lat: 68, lng: 28, reportedBy: "Rahul M.", reportedAt: ago(180), assignedTo: "W-411", beforePhoto: "⚡", afterPhoto: "🔌", citizenVerified: true, priority: "high", aiConfidence: 0.93, description: "Sparks from junction box." },
];

export const WORKERS = [
  { id: "W-118", name: "Suresh K.", department: "garbage" as Department, area: "Sector 7" },
  { id: "W-204", name: "Anil P.", department: "roads" as Department, area: "MG Road" },
  { id: "W-302", name: "Deepa N.", department: "water" as Department, area: "Old Town" },
  { id: "W-411", name: "Rakesh V.", department: "electricity" as Department, area: "Old Town" },
  { id: "W-512", name: "Joseph A.", department: "drainage" as Department, area: "Industrial Belt" },
];

export const STATUS_LABEL: Record<IssueStatus, string> = {
  submitted: "Submitted",
  received: "Received by authority",
  assigned: "Assigned to worker",
  in_progress: "In progress",
  resolved: "Resolved by worker",
  verified: "Verified by citizen",
};

export const STATUS_ORDER: IssueStatus[] = ["submitted", "received", "assigned", "in_progress", "resolved", "verified"];
