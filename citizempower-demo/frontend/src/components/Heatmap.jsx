// HeatmapXII.jsx
// Magic Pack XII (GovTech Edition) - demo-mode, frontend-only
// Requires: react, react-leaflet, leaflet, leaflet.heat
import React, { useEffect, useRef, useState, useMemo } from "react";
import { MapContainer, TileLayer, Polygon, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

// small CSS for pulse and 3D mode
const styleCSS = `
.leaflet-pulse { background: rgba(255,0,0,0.8); width:18px; height:18px; border-radius:50%; box-shadow:0 0 0 rgba(255,0,0,0.5); animation:pulse 2s infinite;}
@keyframes pulse {0%{box-shadow:0 0 0 0 rgba(255,0,0,0.6);} 70%{box-shadow:0 0 0 20px rgba(255,0,0,0);} 100%{box-shadow:0 0 0 0 rgba(255,0,0,0);}}
.leaflet-3d { transform: perspective(1000px) rotateX(18deg) translateY(-10px); box-shadow: 0 20px 60px rgba(2,6,23,0.25); border-radius:8px; overflow:hidden;}
.legend-box { background: rgba(0,0,0,0.6); color:white; padding:8px 10px; border-radius:8px; font-size:13px;}
.controls { display:flex; gap:8px; flex-wrap:wrap;}
.btn { padding:8px 12px; border-radius:8px; border:1px solid #0f172a; cursor:pointer; background:white; color:#0f172a; font-weight:600;}
.btn.active { background:#0f172a; color:white;}
.badge { padding:6px 8px; border-radius:8px; background:#fff; box-shadow: 0 4px 12px rgba(2,6,23,0.06); }
`;

// add style once
if (typeof document !== "undefined") {
  const s = document.createElement("style");
  s.innerHTML = styleCSS;
  document.head.appendChild(s);
}

export default function HeatmapXII({ data = [] }) {
  const mapRef = useRef(null);
  const heatRef = useRef(null);
  const pulseLayerRef = useRef(null);
  const [tileMode, setTileMode] = useState("street");
  const [filter, setFilter] = useState("all");
  const [mapMode, setMapMode] = useState("normal"); // normal | emergency | extreme
  const [predictMode, setPredictMode] = useState(false);
  const [timeIndex, setTimeIndex] = useState(6);
  const [threeD, setThreeD] = useState(false);
  const [trafficOn, setTrafficOn] = useState(true);
  const [routeOn, setRouteOn] = useState(false);
  const waveformRef = useRef(0);

  // ensure Mumbai area coords if your data uses other city: if many points are outside, we will inject a few demo mumbai points
  const normalized = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) {
      // generate demo Mumbai data
      return demoMumbaiData(40);
    }
    // validate numeric lat/lng; filter out malformed:
    const good = data.filter((d) => isFiniteNumber(d.lat) && isFiniteNumber(d.lng));
    // if few points or coordinates not in mumbai range, add mumbai demo cluster
    const inMumbai = good.filter((g) => g.lat >= 18.90 && g.lat <= 19.30 && g.lng >= 72.75 && g.lng <= 73.10);
    if (good.length === 0 || inMumbai.length / good.length < 0.4) {
      // merge and return
      return good.concat(demoMumbaiData(25));
    }
    return good;
  }, [data]);

  // prediction mock
  const predictedPoints = useMemo(() => {
    return demoPredictedPoints(25);
  }, []);

  // time-sliced selection: simple approach -> take prefix of normalized
  const timeSlice = useMemo(() => {
    const size = Math.max(1, Math.floor((timeIndex + 1) / 7 * normalized.length));
    return normalized.slice(0, size || normalized.length);
  }, [normalized, timeIndex]);

  // pick data source
  const activePoints = predictMode ? predictedPoints : (mapMode === "normal" ? timeSlice : mapMode === "emergency" ? generateCluster(30) : generateCluster(50, 0.012));

  // apply filter by urgency
  const filtered = activePoints.filter((p) => (filter === "all" ? true : p.urgency === filter));

  // convert to leaflet-heat points
  const heatPoints = filtered.map((i) => [i.lat, i.lng, urgencyWeight(i.urgency)]);

  // main effect: draw heat + pulses + optionally route + traffic animation
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // remove old layers
    if (heatRef.current) { heatRef.current.remove(); heatRef.current = null; }
    if (pulseLayerRef.current) { pulseLayerRef.current.clearLayers(); }

    // add heat layer
    // eslint-disable-next-line no-undef
    const heat = L.heatLayer(heatPoints, {
      radius: 36,
      blur: 24,
      maxZoom: 17,
      gradient: { 0.1: "#00ff00", 0.3: "#ffee00", 0.5: "#ff8800", 0.7: "#ff0000", 1.0: "#7f0000" },
    }).addTo(map);
    heatRef.current = heat;

    // pulse markers for high urgency
    if (!pulseLayerRef.current) pulseLayerRef.current = L.layerGroup().addTo(map);
    filtered.forEach((i) => {
      if (i.urgency === "High") {
        const icon = L.divIcon({ html: '<span class="leaflet-pulse"></span>', className: "" });
        const m = L.marker([i.lat, i.lng], { icon }).addTo(pulseLayerRef.current);
        m.bindPopup(`<b>Critical:</b> ${escapeHtml(i.description || "No desc")}<br/><small>${i.category || ""}</small>`);
      }
    });

    // auto-zoom to bounds
    if (filtered.length > 0) {
      const bounds = filtered.map((p) => [p.lat, p.lng]);
      try { map.fitBounds(bounds, { padding: [60, 60] }); } catch (e) { /* ignore */ }
    }

    // traffic overlay: animated polylines (mock routes)
    if (trafficOn) {
      addTrafficAnimation(map);
    } else {
      removeTraffic(map);
    }

    // route overlay: a demo route between two hotspots
    if (routeOn) {
      // remove existing route if present
      removeDemoRoute(map);
      addDemoRoute(map, filtered[0]?.lat || 19.07, filtered[0]?.lng || 72.87, filtered[1]?.lat || 19.06, filtered[1]?.lng || 72.89);
    } else {
      removeDemoRoute(map);
    }

    return () => {
      // cleanup
      if (heatRef.current) { heatRef.current.remove(); heatRef.current = null; }
      if (pulseLayerRef.current) { pulseLayerRef.current.clearLayers(); }
      removeTraffic(map);
      removeDemoRoute(map);
    };
  }, [heatPoints.join("|"), filter, trafficOn, routeOn, predictMode, mapMode, timeIndex]);

  // small effect: waveform animation for density (visual only)
  useEffect(() => {
    let raf;
    function loop() {
      waveformRef.current = (waveformRef.current + 0.03) % (Math.PI * 2);
      // optionally we could animate heat intensity via setLatLngs -> heavy; skip for perf
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // mock ward polygons for overlay
  const wardPolygons = [
    { name: "Ward A", coords: [[19.08,72.87],[19.095,72.895],[19.07,72.905],[19.055,72.885]], risk: 0.6 },
    { name: "Ward B", coords: [[19.04,72.86],[19.06,72.88],[19.05,72.9],[19.03,72.89]], risk: 0.3 },
  ];

  // aggregated ward analytics
  const wardStats = wardPolygons.map(w => {
    const count = normalized.filter(p => pointInPoly([p.lat, p.lng], w.coords)).length;
    return { name: w.name, count, risk: w.risk };
  });

  return (
    <div style={{ height: "100%", position: "relative" }}>
      {/* Controls */}
      <div style={{ position: "absolute", top: 10, left: 10, zIndex: 9999 }}>
        <div className="controls">
          <button className={`btn ${tileMode==="street"?"active":""}`} onClick={() => setTileMode("street")}>Street</button>
          <button className={`btn ${tileMode==="sat"?"active":""}`} onClick={() => setTileMode("sat")}>Satellite</button>
          <button className={`btn ${mapMode==="normal"?"active":""}`} onClick={() => setMapMode("normal")}>Normal</button>
          <button className={`btn ${mapMode==="emergency"?"active":""}`} onClick={() => setMapMode("emergency")}>Emergency</button>
          <button className={`btn ${mapMode==="extreme"?"active":""}`} onClick={() => setMapMode("extreme")}>Extreme</button>

          <button className={`btn ${predictMode?"active":""}`} onClick={() => setPredictMode(p => !p)}>{predictMode ? "Predicting 🔮" : "Predict"}</button>
          <button className={`btn ${threeD?"active":""}`} onClick={() => setThreeD(t => !t)}>{threeD ? "3D On" : "3D Mode"}</button>
          <button className={`btn ${trafficOn?"active":""}`} onClick={() => setTrafficOn(t => !t)}>{trafficOn ? "Traffic On" : "Traffic Off"}</button>
          <button className={`btn ${routeOn?"active":""}`} onClick={() => setRouteOn(r => !r)}>{routeOn ? "Route On" : "Route"}</button>
        </div>
        <div style={{ marginTop:8 }} className="controls">
          <button className={`btn ${filter==="all"?"active":""}`} onClick={()=>setFilter("all")}>All</button>
          <button className={`btn ${filter==="High"?"active":""}`} onClick={()=>setFilter("High")}>High</button>
          <button className={`btn ${filter==="Medium"?"active":""}`} onClick={()=>setFilter("Medium")}>Medium</button>
          <button className={`btn ${filter==="Low"?"active":""}`} onClick={()=>setFilter("Low")}>Low</button>
        </div>
      </div>

      {/* Legend & Ward analytics */}
      <div style={{ position: "absolute", bottom: 10, left: 10, zIndex: 9999 }}>
        <div className="legend-box">🔥 Heat Legend • Green→Red • {filtered.length} shown</div>
        <div style={{ marginTop:8, background:"white", padding:8, borderRadius:8, boxShadow:"0 6px 18px rgba(2,6,23,0.08)" }}>
          <div style={{ fontWeight:700 }}>Ward Analytics</div>
          {wardStats.map(w => <div key={w.name} style={{ fontSize:13 }}>{w.name}: {w.count} reports • Risk: {Math.round(w.risk*100)}%</div>)}
        </div>
      </div>

      {/* Time slider */}
      <div style={{ position: "absolute", bottom: 10, right: 10, zIndex: 9999, display: predictMode ? "none" : "block" }}>
        <div style={{ background:"rgba(0,0,0,0.6)", color:"white", padding:8, borderRadius:8 }}>
          <div style={{ fontSize:13 }}>Last {timeIndex+1} days</div>
          <input type="range" min="0" max="6" value={timeIndex} onChange={(e)=>setTimeIndex(Number(e.target.value))} />
        </div>
      </div>

      {/* Map */}
      <div style={{ height:"100%", width:"100%", ...(threeD ? { transformOrigin:"center top" } : {}) }} className={threeD ? "leaflet-3d" : ""}>
        <MapContainer
          center={[19.076,72.877]}
          zoom={11}
          style={{ height:"100%", width:"100%" }}
          whenCreated={map => { mapRef.current = map; }}
        >
          <TileLayer url={tileMode==="sat" ? "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png" : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"} />
          {/* ward polygons */}
          {wardPolygons.map((w,i) => <Polygon key={i} positions={w.coords} pathOptions={{ fillColor: `rgba(255,0,0,${w.risk*0.4})`, color:"#ff0000", weight:1 }} />)}
          {/* markers for filtered points (click to show AI root cause popups) */}
          {filtered.map((p, idx) => (
            <Marker key={idx} position={[p.lat,p.lng]}>
              <Popup>
                <b>{p.category}</b><br/>
                {p.description}<br/>
                <small>Urgency: {p.urgency}</small>
                <hr/>
                <b>AI Root Cause (mock):</b> {aiRootCause(filtered, p)}
              </Popup>
            </Marker>
          ))}
          {/* route demo and traffic polylines are injected into map via main effect functions */}
        </MapContainer>
      </div>
    </div>
  );
}

/* ----------------- Helper and Mock Functions ----------------- */

function isFiniteNumber(v) { return typeof v === "number" && isFinite(v); }

function urgencyWeight(u) { return u === "High" ? 4 : u === "Medium" ? 2 : 1; }

function demoMumbaiData(n=30){
  const centerLat = 19.07, centerLng = 72.87;
  const out = [];
  const urg = ["Low","Medium","High"];
  for(let i=0;i<n;i++){
    out.push({
      lat: centerLat + (Math.random()-0.5)*0.12,
      lng: centerLng + (Math.random()-0.5)*0.12,
      urgency: urg[Math.floor(Math.random()*urg.length)],
      description: ["Garbage not collected","Water leakage","Pothole cluster","Streetlight outage"][Math.floor(Math.random()*4)],
      category: ["Garbage","Water","Road","Electricity"][Math.floor(Math.random()*4)],
      department: ["MCGM","BWSSB","Traffic","Electrical"][Math.floor(Math.random()*4)],
      pincode: ["400013","400017","400018","400026"][Math.floor(Math.random()*4)],
      createdAt: new Date(Date.now()-Math.floor(Math.random()*1000*60*60*24*14)).toISOString()
    });
  }
  return out;
}

function demoPredictedPoints(n=20){
  const out = [];
  for(let i=0;i<n;i++){
    out.push({ lat:19.02 + Math.random()*0.08, lng:72.80 + Math.random()*0.20, urgency:"High", description:"Predicted hotspot", category:"Sanitation" });
  }
  return out;
}

function generateCluster(n=20, spread=0.02){
  const lat0 = 19.04, lng0 = 72.87;
  const arr=[];
  for(let i=0;i<n;i++){
    arr.push({ lat: lat0 + (Math.random()-0.5)*spread, lng: lng0 + (Math.random()-0.5)*spread, urgency:"High", description:"Cluster demo", category:"Water"});
  }
  return arr;
}

/* ---------------- Traffic / Route Overlays (mock, animated) ---------------- */
let trafficLayers = [];
function addTrafficAnimation(map){
  removeTraffic(map);
  // create 3 polylines representing roads with moving markers
  const routes = [
    [[19.06,72.85],[19.07,72.90],[19.09,72.92]],
    [[19.04,72.88],[19.05,72.86],[19.08,72.87],[19.10,72.89]],
    [[19.02,72.84],[19.06,72.86],[19.08,72.90]]
  ];
  trafficLayers = routes.map((r,idx)=>{
    const poly = L.polyline(r, { color: idx===0 ? "#f97316" : idx===1 ? "#f43f5e" : "#fb923c", weight:6, opacity:0.35 }).addTo(map);
    // moving dot along polyline (simple)
    const marker = L.circleMarker(r[0], { radius: 6, color: "#111827", fillColor:"#fff", fillOpacity:1 }).addTo(map);
    // animate by shifting point index using interval
    let t = 0;
    const iv = setInterval(()=>{
      t = (t + 1) % r.length;
      marker.setLatLng(r[t]);
    }, 700 + idx*200);
    return { poly, marker, iv };
  });
}
function removeTraffic(map){
  if(!trafficLayers || trafficLayers.length===0) return;
  trafficLayers.forEach(obj=>{
    if(obj.poly) obj.poly.remove();
    if(obj.marker) obj.marker.remove();
    if(obj.iv) clearInterval(obj.iv);
  });
  trafficLayers = [];
}

/* ---------------- Demo Route (mock shortest path) ---------------- */
let demoRouteLayer = null;
function addDemoRoute(map, lat1, lng1, lat2, lng2){
  removeDemoRoute(map);
  const route = [[lat1,lng1],[ (lat1+lat2)/2 + 0.01, (lng1+lng2)/2 - 0.005 ], [lat2,lng2]];
  demoRouteLayer = L.polyline(route, { color:"#2563eb", weight:4, dashArray:"6 8" }).addTo(map);
  const a = L.marker([lat1,lng1]).addTo(map);
  const b = L.marker([lat2,lng2]).addTo(map);
  demoRouteLayer._extraMarkers = [a,b];
}
function removeDemoRoute(map){
  if(!demoRouteLayer) return;
  try {
    demoRouteLayer._extraMarkers?.forEach(m=>m.remove());
    demoRouteLayer.remove();
  } catch {}
  demoRouteLayer = null;
}

/* ------------------ Utility: point in polygon (ray-casting) ------------------ */
function pointInPoly(point, vs) {
  const x = point[0], y = point[1];
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0], yi = vs[i][1];
    const xj = vs[j][0], yj = vs[j][1];
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

/* ------------------ Simple AI root cause inference (mock) ------------------ */
function aiRootCause(allPoints, point) {
  // cluster nearby points within ~300m radius and infer common category words
  const cluster = allPoints.filter(p => haversine(p.lat,p.lng, point.lat, point.lng) < 0.35); // ~0.35 km
  if (cluster.length === 0) return "No pattern detected";
  const counts = {};
  cluster.forEach(c => { counts[c.category] = (counts[c.category]||0)+1; });
  // top category
  let top = Object.keys(counts).sort((a,b)=>counts[b]-counts[a])[0];
  return `Likely cause: ${top} issues (cluster size ${cluster.length})`;
}

/* ------------------ Small geospatial helpers ------------------ */
function haversine(lat1, lon1, lat2, lon2){
  const toRad = x => x*Math.PI/180;
  const R=6371; // km
  const dLat = toRad(lat2-lat1); const dLon = toRad(lon2-lon1);
  const a = Math.sin(dLat/2)*Math.sin(dLat/2) + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)*Math.sin(dLon/2);
  const c = 2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R*c;
}

/* ------------------ Utilities ------------------ */
function escapeHtml(s){ if(!s) return ""; return String(s).replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }
