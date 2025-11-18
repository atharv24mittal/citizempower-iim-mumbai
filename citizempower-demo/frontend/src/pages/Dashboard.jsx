// Dashboard.jsx (Magic Pack A - Full) - UPDATED WITH MUMBAI COORDINATES
// Replace your existing Dashboard.jsx with this file.
// IMPORTANT: This file assumes ../components/Heatmap is your Leaflet heatmap component.

import React, { useEffect, useMemo, useState } from "react";
import Heatmap from "../components/Heatmap";

/**
 * Dashboard - Full Feature (Magic Pack A)
 * - Normal / Emergency / Extreme heatmap modes
 * - Officer mock auth & tools
 * - SLA timers, timelines, notes
 * - PDF/Print report generation
 * - Category donut + weekly trend (SVG)
 * - Pincode/ward clustering & summary
 * - Predictions (mock)
 *
 * Safeguards: Works even if backend omits lat/lng or createdAt.
 */

export default function Dashboard() {
  // raw data from backend
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // UI state
  const [mapMode, setMapMode] = useState("normal"); // normal, emergency, extreme
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("All");
  const [filterCat, setFilterCat] = useState("All");
  const [filterUrgency, setFilterUrgency] = useState("All");
  const [onlyHotspots, setOnlyHotspots] = useState(false);

  // Officer mock login
  const [user, setUser] = useState(null); // null or {name, role}
  const [authName, setAuthName] = useState("");

  // local UI state for issue modifications (frontend-only)
  const [localIssues, setLocalIssues] = useState({}); // map _id -> local metadata

  // Load backend dashboard safely
  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:3001/api/dashboard")
      .then((res) => {
        if (!res.ok) throw new Error("API failed: " + res.status);
        return res.json();
      })
      .then((d) => {
        // Defensive: ensure structure
        const issues = Array.isArray(d.issues) ? d.issues : [];

        // enhance issues: safe defaults for pincode, lat, lng, createdAt, status
        const enhanced = issues.map((i, idx) => {
          const id = i._id || `local-${idx}-${Math.random().toString(36).slice(2, 7)}`;
          const createdAt = i.createdAt || randomPastDate();
          return {
            _id: id,
            description: i.description || "No description provided",
            category: i.category || "General",
            department: i.department || "Unknown",
            urgency: i.urgency || "Low",
            lat: i.lat ?? randomLat(),
            lng: i.lng ?? randomLng(),
            pincode: i.pincode || randomPin(),
            createdAt,
            // status might not be present; keep minimal default
            status: i.status || "Pending",
            // keep original raw object for reference
            __raw: i,
          };
        });

        // Prepare counts (defensive)
        const categoryCount = d.categoryCount || countBy(enhanced, "category");
        const deptCount = d.deptCount || countBy(enhanced, "department");

        setData({
          total: d.total ?? enhanced.length,
          issues: enhanced,
          categoryCount,
          deptCount,
        });

        // initialize local issues metadata map
        const initialLocal = {};
        enhanced.forEach((iss) => {
          initialLocal[iss._id] = {
            assignedTo: null,
            notes: [],
            status: iss.status,
          };
        });
        setLocalIssues(initialLocal);
        setError("");
      })
      .catch((err) => {
        console.error("Dashboard error:", err);
        setError("Unable to load dashboard. Check backend.");
      })
      .finally(() => setLoading(false));
  }, []);

  // Emergency demo datasets (for presentation) - MUMBAI COORDINATES
  const emergencyData = useMemo(() => {
    const clusterCenterLat = 19.04;   // Lower Parel
    const clusterCenterLng = 72.87;   // Worli Area

    const out = [];
    for (let i = 0; i < 30; i++) {
      out.push({
        lat: clusterCenterLat + (Math.random() - 0.5) * 0.02,
        lng: clusterCenterLng + (Math.random() - 0.5) * 0.02,
        urgency: "High",
        description: "Critical issue hotspot (Demo)",
        category: "Water",
        department: "MCGM",
        pincode: "400013",
        createdAt: new Date().toISOString(),
      });
    }
    return out;
  }, []);

  const extremeData = useMemo(() => {
    const clusterCenterLat = 19.08;   // South Mumbai
    const clusterCenterLng = 72.88;   // Fort Area

    const out = [];
    for (let i = 0; i < 42; i++) {
      out.push({
        lat: clusterCenterLat + (Math.random() - 0.5) * 0.015,
        lng: clusterCenterLng + (Math.random() - 0.5) * 0.015,
        urgency: "High",
        description: "Critical cluster: contamination + outages",
        category: "Multi",
        department: "MULTI",
        pincode: "400001",
        createdAt: new Date().toISOString(),
      });
    }
    return out;
  }, []);

  // Loading / error handling
  if (error) return <p style={{ color: "red", padding: 12 }}>{error}</p>;
  if (loading || !data) return <p style={{ padding: 12 }}>Loading dashboard...</p>;

  // Derived lists
  let issues = data.issues.slice(); // copy

  // Apply search + filters
  issues = issues.filter((i) => {
    const txt = (i.description + " " + i.category + " " + i.department + " " + i.pincode).toLowerCase();
    if (search && !txt.includes(search.toLowerCase())) return false;
    if (filterDept !== "All" && i.department !== filterDept) return false;
    if (filterCat !== "All" && i.category !== filterCat) return false;
    if (filterUrgency !== "All" && i.urgency !== filterUrgency) return false;
    return true;
  });

  // Optional onlyHotspots filter (show urgent only)
  const validIssues = onlyHotspots ? issues.filter((i) => i.urgency === "High") : issues;

  // Choose map data based on mode
  const mapData = mapMode === "normal" ? validIssues
    : mapMode === "emergency" ? emergencyData
    : extremeData;

  // Analytics
  const total = data.total ?? data.issues.length;
  const criticalCount = data.issues.filter((i) => i.urgency === "High").length;
  const categories = data.categoryCount || countBy(data.issues, "category");
  const departments = data.deptCount || countBy(data.issues, "department");
  const mostCommonPin = mostFrequent(data.issues.map((i) => i.pincode));

  // Prediction (mock): simple linear trend on mock weekly data
  const weeklyMock = generateWeeklyMock(data.issues);
  const predictedNextWeek = predictNextWeek(weeklyMock);

  // handlers (frontend-only)
  function assignOfficer(issueId, officerName) {
    setLocalIssues((prev) => ({
      ...prev,
      [issueId]: {
        ...(prev[issueId] || {}),
        assignedTo: officerName,
        notes: [...((prev[issueId] && prev[issueId].notes) || []), `Assigned to ${officerName} (mock)`],
      },
    }));
  }

  function addNote(issueId, note) {
    setLocalIssues((prev) => ({
      ...prev,
      [issueId]: {
        ...(prev[issueId] || {}),
        notes: [...((prev[issueId] && prev[issueId].notes) || []), note],
      },
    }));
  }

  function changeStatus(issueId, status) {
    setLocalIssues((prev) => ({
      ...prev,
      [issueId]: {
        ...(prev[issueId] || {}),
        status,
      },
    }));
  }

  function printIssue(issue) {
    // Create a printable window with basic styling and issue content
    const printable = `
      <html><head><title>Issue Report</title>
      <style>
        body { font-family: Inter, Arial, sans-serif; padding: 20px; color: #111; }
        .card { border: 1px solid #ddd; padding: 18px; border-radius: 10px; }
        h2 { margin-top: 0; }
        pre { background:#f8fafc; padding:12px; border-radius:8px; }
      </style>
      </head><body>
        <div class="card">
          <h2>Issue Report</h2>
          <p><strong>Category:</strong> ${escapeHtml(issue.category)}</p>
          <p><strong>Department:</strong> ${escapeHtml(issue.department)}</p>
          <p><strong>Urgency:</strong> ${escapeHtml(issue.urgency)}</p>
          <p><strong>Pincode:</strong> ${escapeHtml(issue.pincode)}</p>
          <p><strong>Created:</strong> ${escapeHtml(issue.createdAt)}</p>
          <h3>Description</h3>
          <pre>${escapeHtml(issue.description)}</pre>
        </div>
      </body></html>
    `;
    const w = window.open("", "_blank");
    if (!w) return alert("Popup blocked — allow popups to print.");
    w.document.write(printable);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 600);
  }

  // mock officer login
  function loginMock() {
    if (!authName) return alert("Enter a name to login (mock).");
    setUser({ name: authName, role: "Officer" });
    setAuthName("");
  }
  function logoutMock() {
    setUser(null);
  }

  // UI render
  return (
    <div style={{ padding: 20, fontFamily: "Inter, Arial, sans-serif", maxWidth: 1300, margin: "0 auto" }}>
      {/* Header */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 30 }}>📊 CitizEMPOWER — Command Center</h1>
          <p style={{ margin: "6px 0 0", color: "#475569" }}>
            Complete demo-ready civic dashboard — maps, insights, SLA, officer tools, and reports.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {!user ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                placeholder="Officer name (mock)"
                value={authName}
                onChange={(e) => setAuthName(e.target.value)}
                style={{ padding: 8, borderRadius: 8, border: "1px solid #cbd5e1" }}
              />
              <button onClick={loginMock} style={primaryBtn}>Login (Mock)</button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ color: "#0f172a", fontWeight: 700 }}>{user.name}</div>
              <div style={{ color: "#64748b" }}>Officer</div>
              <button onClick={logoutMock} style={secondaryBtn}>Logout</button>
            </div>
          )}
        </div>
      </header>

      {/* Executive summary */}
      <section style={{ display: "flex", gap: 16, marginTop: 18, flexWrap: "wrap" }}>
        <SummaryCard label="Total Issues" value={total} emoji="📌" color="#e0f2fe" />
        <SummaryCard label="Critical" value={criticalCount} emoji="🚨" color="#fee2e2" />
        <SummaryCard label="Top Category" value={mostFrequent(Object.keys(categories).length ? Object.keys(categories) : ["N/A"])} emoji="🔥" color="#fef9c3" />
        <SummaryCard label="Top Hotspot (pincode)" value={mostCommonPin || "N/A"} emoji="📍" color="#dcfce7" />
        <SummaryCard label="Prediction (mock)" value={`${predictedNextWeek} issues next week`} emoji="📈" color="#eef2ff" />
      </section>

      {/* Controls */}
      <section style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ padding: 10, borderRadius: 8, border: "1px solid #cbd5e1", minWidth: 220 }} />

        <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} style={selectStyle}>
          <option>All</option>
          {Object.keys(departments).map((d) => <option key={d}>{d}</option>)}
        </select>

        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} style={selectStyle}>
          <option>All</option>
          {Object.keys(categories).map((c) => <option key={c}>{c}</option>)}
        </select>

        <select value={filterUrgency} onChange={(e) => setFilterUrgency(e.target.value)} style={selectStyle}>
          <option>All</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>

        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input type="checkbox" checked={onlyHotspots} onChange={(e) => setOnlyHotspots(e.target.checked)} />
          Only Hotspots
        </label>

        {/* Map mode toggles */}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button onClick={() => setMapMode("normal")} style={mapMode === "normal" ? mapActiveBtn : mapBtn}>Normal Map</button>
          <button onClick={() => setMapMode("emergency")} style={mapMode === "emergency" ? mapActiveBtn : { ...mapBtn, background: "#fb923c", color: "white" }}>Emergency Map</button>
          <button onClick={() => setMapMode("extreme")} style={mapMode === "extreme" ? mapActiveBtn : { ...mapBtn, background: "#b91c1c", color: "white" }}>Extreme Demo</button>
        </div>
      </section>

      {/* Charts + map row */}
      <section style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: 18, marginTop: 22 }}>
        {/* Left column: charts + lists */}
        <div>
          {/* Charts */}
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 300px", background: "white", padding: 12, borderRadius: 12, boxShadow: boxShadow }}>
              <h3 style={{ marginTop: 0 }}>Category Distribution</h3>
              <DonutChart data={categories} />
            </div>

            <div style={{ flex: "1 1 300px", background: "white", padding: 12, borderRadius: 12, boxShadow: boxShadow }}>
              <h3 style={{ marginTop: 0 }}>Weekly Trend (mock)</h3>
              <TrendChart data={weeklyMock} />
            </div>
          </div>

          {/* Issue list */}
          <div style={{ marginTop: 18 }}>
            <h3>Recent Issues</h3>
            {issues.slice(0, 12).map((i) => (
              <div key={i._id} style={{ marginBottom: 12 }}>
                <IssueCardFull
                  issue={i}
                  localMeta={localIssues[i._id] || {}}
                  assignOfficer={assignOfficer}
                  addNote={addNote}
                  changeStatus={changeStatus}
                  printIssue={printIssue}
                  user={user}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right column: map + insights */}
        <div>
          <div style={{ background: "white", padding: 12, borderRadius: 12, boxShadow: boxShadow }}>
            <h3 style={{ marginTop: 0 }}>Heatmap</h3>
            <div style={{ height: 420, borderRadius: 10, overflow: "hidden" }}>
              <Heatmap data={mapData} />
            </div>
            <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
              <div style={{ fontSize: 13, color: "#475569" }}>Mode:</div>
              <div style={{ fontWeight: 700 }}>{mapMode}</div>
              <div style={{ marginLeft: "auto", color: "#64748b", fontSize: 13 }}>
                Intensity scales with urgency (High → higher weight)
              </div>
            </div>
          </div>

          {/* AI Insights */}
          <div style={{ marginTop: 14, background: "#0b1220", color: "white", padding: 14, borderRadius: 12 }}>
            <h4 style={{ marginTop: 0 }}>AI Insights (Mock)</h4>
            <div style={{ fontSize: 14 }}>
              <div>📍 Hotspot: {mostCommonPin}</div>
              <div>🔥 Rising: {mostFrequent(issues.map((x) => x.category))}</div>
              <div>📈 Predicted next week: {predictedNextWeek} new issues</div>
              <div style={{ marginTop: 8, color: "#c7d2fe" }}>
                Tip: use Emergency / Extreme map during live demo to show cluster effect.
              </div>
            </div>
          </div>

          {/* Ward / Pincode summary */}
          <div style={{ marginTop: 14, background: "white", padding: 12, borderRadius: 12, boxShadow: boxShadow }}>
            <h4 style={{ marginTop: 0 }}>Ward / Pincode Summary</h4>
            <PincodeSummary issues={data.issues} />
          </div>
        </div>
      </section>

      {/* Footer actions */}
      <section style={{ marginTop: 22, display: "flex", gap: 8, alignItems: "center" }}>
        <button onClick={() => window.print()} style={primaryBtn}>Print Dashboard</button>
        <button onClick={() => exportCSV(data.issues)} style={secondaryBtn}>Export CSV (mock)</button>
        <div style={{ marginLeft: "auto", color: "#64748b" }}>Demo-mode: All officer actions are frontend-only (safe)</div>
      </section>
    </div>
  );
}

/* ---------------- Helper components & functions ---------------- */

const primaryBtn = {
  padding: "8px 12px",
  borderRadius: 8,
  background: "#0f172a",
  color: "white",
  border: "none",
  cursor: "pointer",
};

const secondaryBtn = {
  padding: "8px 12px",
  borderRadius: 8,
  background: "white",
  color: "#0f172a",
  border: "1px solid #e2e8f0",
  cursor: "pointer",
};

const mapBtn = {
  padding: "8px 10px",
  borderRadius: 8,
  background: "#111827",
  color: "white",
  border: "none",
  cursor: "pointer",
};
const mapActiveBtn = {
  ...mapBtn,
  boxShadow: "0 6px 20px rgba(2,6,23,0.12)",
  transform: "translateY(-2px)",
};

const selectStyle = { padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" };
const boxShadow = "0 6px 20px rgba(2,6,23,0.04)";

function SummaryCard({ label, value, emoji, color }) {
  return (
    <div style={{ background: color, padding: 12, borderRadius: 12, minWidth: 160, boxShadow }}>
      <div style={{ fontSize: 20 }}>{emoji}</div>
      <div style={{ fontWeight: 800, fontSize: 20 }}>{value}</div>
      <div style={{ color: "#475569" }}>{label}</div>
    </div>
  );
}

function PincodeSummary({ issues }) {
  const counts = {};
  for (const i of issues) {
    const pin = i.pincode || "Unknown";
    counts[pin] = (counts[pin] || 0) + 1;
  }
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  return (
    <div>
      <div style={{ fontSize: 13, color: "#475569" }}>Top pincodes by reports</div>
      <ul style={{ marginTop: 8 }}>
        {top.map(([p, n]) => (
          <li key={p}><b>{p}</b> — {n}</li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------- Issue Card - full with officer tools, SLA, timeline ---------------- */
function IssueCardFull({ issue, localMeta, assignOfficer, addNote, changeStatus, printIssue, user }) {
  const [noteText, setNoteText] = useState("");
  const status = (localMeta && localMeta.status) || issue.status || "Pending";
  const assignedTo = (localMeta && localMeta.assignedTo) || "Unassigned";

  // SLA calculation
  const sla = calcSLA(issue);

  return (
    <div style={{ border: "1px solid #e6eef8", padding: 12, borderRadius: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontWeight: 800 }}>{issue.category} • {issue.department}</div>
          <div style={{ color: "#475569", marginTop: 6 }}>{issue.description}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ padding: "6px 10px", borderRadius: 8, background: urgencyColor(issue.urgency), fontWeight: 700 }}>
            {issue.urgency}
          </div>
          <div style={{ marginTop: 8, color: "#64748b" }}>Pincode: {issue.pincode}</div>
        </div>
      </div>

      {/* timeline + SLA */}
      <div style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "center" }}>
        <div style={{ fontSize: 13, color: "#475569" }}>
          <b>Created:</b> {formatDate(issue.createdAt)} &nbsp;•&nbsp; <b>SLA:</b> {sla}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button onClick={() => printIssue(issue)} style={secondaryBtn}>Print</button>
          <button onClick={() => changeStatus(issue._id, status === "Resolved" ? "Pending" : "Resolved")} style={primaryBtn}>
            {status === "Resolved" ? "Mark Pending" : "Mark Resolved"}
          </button>
        </div>
      </div>

      {/* Officer tools (only visible to logged-in mock officer) */}
      {user && (
        <div style={{ marginTop: 12, background: "#f8fafc", padding: 10, borderRadius: 8 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ fontSize: 13, color: "#475569" }}><b>Assigned to:</b> {assignedTo}</div>
            <button onClick={() => assignOfficer(issue._id, user.name)} style={{ padding: "6px 10px", borderRadius: 6, cursor: "pointer" }}>Assign to me</button>

            <select onChange={(e) => changeStatus(issue._id, e.target.value)} value={status} style={{ marginLeft: "auto", padding: 8, borderRadius: 8 }}>
              <option>Pending</option>
              <option>In Progress</option>
              <option>Resolved</option>
            </select>
          </div>

          <div style={{ marginTop: 8 }}>
            <input value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Add note..." style={{ padding: 8, borderRadius: 6, border: "1px solid #cbd5e1", width: "70%" }} />
            <button onClick={() => { if (noteText.trim()) { addNote(issue._id, `${new Date().toLocaleString()}: ${noteText}`); setNoteText(""); } }} style={{ marginLeft: 8, padding: "6px 10px", borderRadius: 6 }}>Add</button>
          </div>

          {/* notes */}
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 13, color: "#0f172a", fontWeight: 700 }}>Notes</div>
            <div style={{ marginTop: 8, maxHeight: 120, overflow: "auto" }}>
              {((localMeta && localMeta.notes) || []).map((n, idx) => (
                <div key={idx} style={{ fontSize: 13, padding: "6px 8px", borderRadius: 8, marginBottom: 6, background: "white", border: "1px solid #eef2ff" }}>
                  {n}
                </div>
              ))}
              {(!localMeta || !localMeta.notes || localMeta.notes.length === 0) && <div style={{ color: "#94a3b8" }}>No notes yet</div>}
            </div>
          </div>
        </div>
      )}

      {/* timeline mock (visual) */}
      <div style={{ marginTop: 12 }}>
        <small style={{ color: "#64748b" }}><b>Timeline</b></small>
        <ul style={{ marginTop: 8 }}>
          <li>Complaint submitted — {formatDate(issue.createdAt)}</li>
          <li>AI triaged & assigned (mock)</li>
          <li>Officer assigned — {localMeta && localMeta.assignedTo ? localMeta.assignedTo : "not assigned"}</li>
          <li>Follow-up recommended in 48 hrs (mock)</li>
        </ul>
      </div>
    </div>
  );
}

/* ---------------- Charts (lightweight SVG) ---------------- */

function DonutChart({ data }) {
  // data: {category: count}
  const entries = Object.entries(data);
  const total = entries.reduce((s, [, v]) => s + v, 0) || 1;
  const colors = ["#60a5fa", "#f59e0b", "#34d399", "#f87171", "#a78bfa", "#60a5fa", "#f97316"];

  let cumulative = 0;
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <svg width="120" height="120" viewBox="-1 -1 2 2" style={{ transform: "rotate(-90deg)" }}>
        {entries.map(([k, v], idx) => {
          const portion = v / total;
          const start = cumulative;
          cumulative += portion;
          const end = cumulative;
          const large = portion > 0.5 ? 1 : 0;
          const x1 = Math.cos(2 * Math.PI * start);
          const y1 = Math.sin(2 * Math.PI * start);
          const x2 = Math.cos(2 * Math.PI * end);
          const y2 = Math.sin(2 * Math.PI * end);
          const path = `M 0 0 L ${x1} ${y1} A 1 1 0 ${large} 1 ${x2} ${y2} Z`;
          return <path key={k} d={path} fill={colors[idx % colors.length]} stroke="#fff" strokeWidth="0.01" />;
        })}
      </svg>

      <div>
        {entries.map(([k, v], idx) => (
          <div key={k} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
            <div style={{ width: 12, height: 12, background: colors[idx % colors.length], borderRadius: 3 }} />
            <div style={{ fontSize: 13 }}>{k}: <strong>{v}</strong></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrendChart({ data }) {
  // data: array of 7 numbers
  const points = data && data.length === 7 ? data : [2, 4, 6, 5, 8, 9, 11];
  const max = Math.max(...points, 1);
  return (
    <svg width="100%" height="120">
      <polyline
        fill="none"
        stroke="#2563eb"
        strokeWidth="2"
        points={points.map((p, i) => `${i * 60 + 20},${100 - (p / max) * 80}`).join(" ")}
      />
      {points.map((p, i) => <circle key={i} cx={i * 60 + 20} cy={100 - (p / max) * 80} r={4} fill="#2563eb" />)}
    </svg>
  );
}

/* ---------------- UPDATED MUMBAI COORDINATE FUNCTIONS ---------------- */

function randomLat() {
  // Mumbai approx range: 18.90 → 19.30
  return 18.95 + Math.random() * 0.35; 
}

function randomLng() {
  // Mumbai approx range: 72.75 → 73.10
  return 72.80 + Math.random() * 0.30;  
}

function randomPin() {
  const pins = [
    "400001", "400002", "400003", "400004", "400005",
    "400006", "400007", "400008", "400009", "400010",
    "400011", "400012", "400013", "400014", "400015",
    "400016", "400017", "400018", "400019", "400020",
    "400021", "400022", "400024", "400025", "400026"
  ];
  return pins[Math.floor(Math.random() * pins.length)];
}

/* ---------------- Utilities ---------------- */

function mostFrequent(arr) {
  if (!arr || arr.length === 0) return "N/A";
  const freq = {};
  let best = arr[0];
  for (const x of arr) {
    freq[x] = (freq[x] || 0) + 1;
    if (freq[x] > (freq[best] || 0)) best = x;
  }
  return best;
}

function countBy(arr, key) {
  const out = {};
  for (const i of arr) {
    const k = i[key] || "Unknown";
    out[k] = (out[k] || 0) + 1;
  }
  return out;
}

function randomPastDate() {
  const now = Date.now();
  const delta = Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 20); // up to 20 days ago
  return new Date(now - delta).toISOString();
}
function formatDate(d) {
  try {
    return new Date(d).toLocaleString();
  } catch {
    return d;
  }
}
function calcSLA(issue) {
  // SLA rules (demo):
  // High -> 24 hours, Medium -> 72 hours, Low -> 120 hours
  const hours = issue.urgency === "High" ? 24 : issue.urgency === "Medium" ? 72 : 120;
  return `${hours} hours`;
}
function urgencyColor(u) {
  if (u === "High") return "#fee2e2";
  if (u === "Medium") return "#fef9c3";
  return "#dcfce7";
}
function escapeHtml(s) {
  if (!s) return "";
  return s.replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
}

// mock weekly generator & predictor
function generateWeeklyMock(issues) {
  // make counts per day (last 7 days) by sampling seriousness
  const counts = new Array(7).fill(0);
  for (const i of issues) {
    const ageDays = Math.min(6, Math.floor((Date.now() - new Date(i.createdAt).getTime()) / (1000 * 60 * 60 * 24)));
    const idx = Math.max(0, 6 - ageDays);
    counts[idx] += (i.urgency === "High" ? 2 : i.urgency === "Medium" ? 1 : 1);
  }
  // if counts are all zero, return a demo waveform
  if (counts.every((c) => c === 0)) return [3, 4, 6, 8, 6, 9, 10];
  return counts;
}
function predictNextWeek(weeklyCounts) {
  // naive prediction: linear trend + small random
  const s = weeklyCounts.reduce((a, b) => a + b, 0);
  const avg = Math.round(s / weeklyCounts.length);
  const trend = weeklyCounts[weeklyCounts.length - 1] - weeklyCounts[0];
  const predicted = Math.max(0, Math.round(avg + trend * 0.3 + Math.random() * 3));
  return predicted;
}

// CSV exporter (frontend-only)
function exportCSV(issues) {
  const headers = ["_id", "category", "department", "urgency", "pincode", "lat", "lng", "createdAt", "description"];
  const rows = issues.map((i) => headers.map((h) => `"${(i[h] || "").toString().replace(/"/g, '""')}"`).join(","));
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "issues_export.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/* ---------------- Exported small components used above ---------------- */

function IssueCard({ issue }) {
  // Minimal issue card (not used in detailed list)
  return (
    <div style={{ padding: 10, borderRadius: 8, background: "white", border: "1px solid #eef2ff" }}>
      <div style={{ fontWeight: 700 }}>{issue.category} — {issue.department}</div>
      <div style={{ color: "#475569", marginTop: 6 }}>{issue.description}</div>
      <div style={{ marginTop: 8 }}>
        <small>Pincode: {issue.pincode} • Created: {formatDate(issue.createdAt)}</small>
      </div>
    </div>
  );
}