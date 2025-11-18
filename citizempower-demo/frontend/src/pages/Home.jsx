import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";

/**
 * Home.jsx
 * CitizEMPOWER — presentation-ready interactive flowchart carousel and FAQ
 *
 * Drop-in replacement for your existing Home.jsx
 * No external libraries required.
 */

export default function Home() {
  // Carousel state
  const [index, setIndex] = useState(0);
  const slideCount = 3;
  const autoplayRef = useRef(null);

  useEffect(() => {
    startAutoplay();
    return stopAutoplay;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  function startAutoplay() {
    stopAutoplay();
    autoplayRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % slideCount);
    }, 7000); // 7 seconds per slide
  }
  function stopAutoplay() {
    if (autoplayRef.current) clearInterval(autoplayRef.current);
  }

  // Keyboard navigation
  useEffect(() => {
    function onKey(e) {
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % slideCount);
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + slideCount) % slideCount);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Slide data: each slide has title, emoji/icon, description, examples, suggested AI output
  const slides = [
    {
      key: "discover",
      title: "I don't know where to go 🤔",
      subtitle: "Discovery → Filing → Tracking → Resolution",
      color: "#FDE68A", // soft yellow
      personEmoji: "🧑‍💼",
      description:
        "Citizen is unsure which government department to approach. Our AI understands natural language, identifies the correct department, prepares a complaint draft, helps submit, and then tracks progress until resolution.",
      examples: [
        {
          problem: "“Sadak kharab hai, koi fix nahi kar raha”",
          ai: "Department: Municipal Corporation → Category: Road/Pothole → Urgency: Medium → Draft: 'Please repair potholes near House No. 12, MG Road...'",
        },
        {
          problem: "“Gas connection nahi aa raha”",
          ai: "Department: Gas Distribution Office → Category: Utility Connection → Urgency: High → Draft included.",
        },
      ],
      callout: "Auto-guides the citizen — no prior knowledge needed.",
    },
    {
      key: "stuck",
      title: "I know where to go but I'm stuck 😤",
      subtitle: "Follow-up Assist → Escalation → Resolution",
      color: "#BFDBFE", // soft blue
      personEmoji: "👩‍⚖️",
      description:
        "Citizen has already filed a complaint but it's stalled. Our AI retrieves the case, checks status, suggests next steps, generates strong escalation drafts, and recommends the officer hierarchy for escalation.",
      examples: [
        {
          problem: "Complaint filed about garbage but no action for 15 days",
          ai: "Check: complaint ID 1234 → Overdue → Suggest escalation draft to Ward Officer & Nodal Officer, include 'pending since' dates, add photo evidence.",
        },
        {
          problem: "Traffic signal not fixed despite multiple requests",
          ai: "Draft an escalation to Traffic Dept. Supervisor + Commissioner escalation if no response in 72 hours.",
        },
      ],
      callout: "Turns stalled cases into resolved outcomes.",
    },
    {
      key: "critical",
      title: "Major / Critical issue ⚠️",
      subtitle: "High-priority escalation → Rapid response",
      color: "#FECACA", // soft red
      personEmoji: "🚨",
      description:
        "For safety or large-impact events (women safety, gas leaks, water contamination), the system flags high urgency, places the case on a heatmap as a red hotspot, and triggers rapid escalation channels to authorities and partners.",
      examples: [
        {
          problem: "Multiple reports of contaminated water in a colony",
          ai: "Flag: High Urgency → Alert: Health Dept & Local MLA → Heatmap cluster detection → Prioritized field response.",
        },
        {
          problem: "A major bridge light collapsed and poses danger",
          ai: "Immediate red-zone tag → Emergency contact + fastest escalation draft with photos and GPS coordinates.",
        },
      ],
      callout: "Designed to get authorities' attention quickly.",
    },
  ];

  // Simple accordion state for FAQ
  const [openFaq, setOpenFaq] = useState(null);

  // Small util: gradient background for hero
  const heroBg = {
    background:
      "linear-gradient(180deg, rgba(30,30,47,0.06) 0%, rgba(255,255,255,0) 40%)",
  };

  // Styles
  const containerStyle = {
    padding: 24,
    maxWidth: 1200,
    margin: "0 auto",
    fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
    color: "#0f172a",
  };

  const heroStyle = {
    display: "flex",
    gap: 24,
    alignItems: "center",
    justifyContent: "space-between",
    padding: "28px",
    borderRadius: 16,
    ...heroBg,
    marginBottom: 30,
  };

  const leftHero = { flex: 1, minWidth: 320 };
  const rightHero = {
    width: 320,
    height: 200,
    borderRadius: 12,
    background:
      "linear-gradient(135deg, rgba(30,30,47,0.9), rgba(30,30,47,0.75))",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 10px 30px rgba(2,6,23,0.12)",
  };

  const titleStyle = { fontSize: 34, fontWeight: 700, margin: 0 };
  const subtitleStyle = { marginTop: 12, color: "#334155", fontSize: 16, lineHeight: 1.55 };

  // Slide card styles
  const slideWrap = {
    position: "relative",
    overflow: "hidden",
    marginTop: 18,
    borderRadius: 14,
  };

  const slidesRow = {
    display: "flex",
    transition: "transform 600ms cubic-bezier(.2,.9,.2,1)",
    width: `${slideCount * 100}%`,
    transform: `translateX(-${(100 / slideCount) * index}%)`,
  };

  const slideCard = (bg) => ({
    width: `${100 / slideCount}%`,
    padding: 28,
    minHeight: 360,
    boxSizing: "border-box",
    background: "#fff",
    display: "flex",
    gap: 20,
    alignItems: "center",
  });

  const personaBox = {
    width: 220,
    height: 220,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    flexShrink: 0,
    boxShadow: "0 12px 30px rgba(2,6,23,0.06)",
  };

  const infoBox = { flex: 1 };

  const exampleStyle = {
    background: "rgba(15,23,42,0.03)",
    padding: 12,
    borderRadius: 10,
    border: "1px solid rgba(2,6,23,0.03)",
    marginTop: 12,
    fontSize: 14,
    color: "#0f172a",
    lineHeight: 1.45,
  };

  const navDotStyle = (active) => ({
    width: 12,
    height: 12,
    borderRadius: 999,
    margin: "0 6px",
    background: active ? "#1e1e2f" : "rgba(2,6,23,0.12)",
    transition: "all .25s",
  });

  // small helper to render SVG person with thought bubble (inline SVG for crispness)
  function PersonSVG({ emoji = "🧑‍💼", bgColor = "#fff" }) {
    return (
      <div style={{ textAlign: "center", width: "100%" }}>
        <svg width="140" height="140" viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="g1" x1="0" x2="1">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#f8fafc" />
            </linearGradient>
          </defs>
          <rect rx="20" width="140" height="140" fill={bgColor} />
          <g transform="translate(10,12)">
            <circle cx="60" cy="34" r="22" fill="#fff" />
            <text x="60" y="40" fontSize="22" textAnchor="middle" dominantBaseline="middle">
              {emoji}
            </text>

            {/* thought bubble */}
            <ellipse cx="18" cy="12" rx="6" ry="5" fill="#fff" />
            <ellipse cx="28" cy="6" rx="10" ry="7" fill="#fff" />
            <ellipse cx="46" cy="6" rx="18" ry="10" fill="#fff" />
            <text x="46" y="36" fontSize="10" textAnchor="middle" fill="#0f172a">
              Thinking...
            </text>
          </g>
        </svg>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* HERO */}
      <div style={heroStyle}>
        <div style={leftHero}>
          <h1 style={titleStyle}>CitizEMPOWER</h1>
          <p style={{ margin: "8px 0 0", color: "#334155", fontSize: 18 }}>
            AI-powered triage, follow-up & civic intelligence — from citizen confusion to transparent resolution.
          </p>
          <p style={subtitleStyle}>
            Show judges the full lifecycle: <b>identify → file → track → escalate → resolve</b>. Demo-ready with live heatmap & follow-up analytics.
          </p>

          <div style={{ marginTop: 18, display: "flex", gap: 12 }}>
            <Link to="/submit" style={{
              padding: "12px 18px",
              borderRadius: 10,
              background: "#0f172a",
              color: "white",
              textDecoration: "none",
              fontWeight: 600
            }}>Submit an Issue</Link>

            <a
              href="#how"
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 420, behavior: "smooth" }); }}
              style={{
                padding: "12px 18px",
                borderRadius: 10,
                background: "transparent",
                color: "#0f172a",
                textDecoration: "none",
                border: "1px solid rgba(15,23,42,0.08)",
                fontWeight: 600
              }}
            >
              How it works
            </a>
          </div>
        </div>

        <div style={rightHero}>
          {/* a compact visual summary inside the hero */}
          <div style={{ textAlign: "center", color: "white", padding: 10 }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>Live Demo</div>
            <div style={{ fontSize: 12, opacity: 0.9, marginTop: 6 }}>AI triage • Escalation • Heatmap</div>
          </div>
        </div>
      </div>

      {/* FLOWCAROUSEL */}
      <section id="how">
        <h2 style={{ fontSize: 26, marginBottom: 12 }}>3 Smart Workflows — Designed for Real Impact</h2>

        <div style={slideWrap}>
          {/* Slides */}
          <div style={slidesRow}>
            {slides.map((s, i) => (
              <div key={s.key} style={slideCard(s.color)}>
                {/* left: persona */}
                <div style={personaBox}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{s.personEmoji}</div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>{s.title}</div>
                  <div style={{ marginTop: 8, fontSize: 13, color: "#475569", padding: "0 6px", textAlign: "center" }}>
                    {s.subtitle}
                  </div>
                </div>

                {/* right: info */}
                <div style={infoBox}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: "#0f172a" }}>{s.title}</div>
                    <div style={{
                      background: s.color,
                      padding: "8px 12px",
                      borderRadius: 10,
                      fontWeight: 700,
                      color: "#0f172a",
                      boxShadow: "inset 0 -8px 18px rgba(0,0,0,0.03)"
                    }}>
                      {s.callout}
                    </div>
                  </div>

                  <p style={{ marginTop: 12, color: "#334155", lineHeight: 1.6 }}>
                    {s.description}
                  </p>

                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontWeight: 700, color: "#0f172a" }}>Examples</div>
                    {s.examples.map((ex, j) => (
                      <div key={j} style={exampleStyle}>
                        <div style={{ fontWeight: 700, marginBottom: 6 }}>Problem</div>
                        <div style={{ fontStyle: "italic", color: "#0f172a" }}>{ex.problem}</div>
                        <div style={{ marginTop: 8, fontWeight: 700 }}>AI Suggests</div>
                        <div style={{ marginTop: 6 }}>{ex.ai}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
                    <button
                      onClick={() => {
                        // autofill in the submit page: using localStorage to pass sample text
                        localStorage.setItem("autofillSample", s.examples[0].problem);
                        window.location.href = "/submit";
                      }}
                      style={{
                        padding: "10px 14px",
                        borderRadius: 10,
                        border: "none",
                        background: "#0f172a",
                        color: "white",
                        cursor: "pointer",
                        fontWeight: 600
                      }}
                    >
                      Try this example →
                    </button>

                    <button
                      onClick={() => setOpenFaq(openFaq === 0 ? null : 0)}
                      style={{
                        padding: "10px 14px",
                        borderRadius: 10,
                        border: "1px solid rgba(2,6,23,0.06)",
                        background: "white",
                        color: "#0f172a",
                        cursor: "pointer",
                        fontWeight: 600
                      }}
                    >
                      FAQs
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* nav controls overlay */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 14,
            marginTop: 16
          }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <button
                aria-label="Previous slide"
                onClick={() => setIndex((i) => (i - 1 + slideCount) % slideCount)}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  border: "none",
                  background: "white",
                  boxShadow: "0 6px 18px rgba(2,6,23,0.06)",
                  cursor: "pointer",
                  fontSize: 18
                }}
              >
                ‹
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center" }}>
              {slides.map((_, i) => (
                <div key={i} style={navDotStyle(i === index)} onClick={() => setIndex(i)} />
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center" }}>
              <button
                aria-label="Next slide"
                onClick={() => setIndex((i) => (i + 1) % slideCount)}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  border: "none",
                  background: "white",
                  boxShadow: "0 6px 18px rgba(2,6,23,0.06)",
                  cursor: "pointer",
                  fontSize: 18
                }}
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- FLOWCHART SECTION (3 BIG ACCORDIONS) ---------------- */}

      <section style={{ marginTop: 60 }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 20 }}>
          Detailed Workflow — How CitizEMPOWER Handles Every Case
        </h2>

        {/* ---- FLOWCHART COMPONENT ---- */}
        {[ 
          {
            title: "Flowchart 1 — When the citizen DOES NOT know where to go 🤔",
            steps: [
              "Citizen faces a problem",
              "Citizen doesn't know department / process",
              "Opens CitizEMPOWER → 'Help me identify'",
              "Citizen enters problem in simple language",
              "AI Triage Engine processes the issue: understands context, identifies department, categorizes issue, sets urgency",
              "AI generates: official complaint draft, correct department details, documents required, step-by-step submission guide",
              "Citizen submits complaint",
              "System stores the issue in database",
              "CitizEMPOWER tracks complaint timeline",
              "Automated reminders: 'Pending for X days', 'Follow-up recommended'",
              "AI generates follow-up draft if delayed",
              "Escalation: higher officer details, helpline numbers, RTI escalation (optional)",
              "Issue resolved by department",
              "Citizen marks 'Resolved'",
              "System updates dashboard: heatmap changes, resolution time recorded",
              "Citizen receives final resolution summary"
            ]
          },
          {
            title: "Flowchart 2 — When the citizen knows the department but is STUCK 😤",
            steps: [
              "Citizen already submitted complaint",
              "Department not responding or case stalled",
              "Citizen opens CitizEMPOWER → 'Follow-up Assist'",
              "Citizen enters complaint ID or describes issue again",
              "AI retrieves issue details: category, department, timelines",
              "AI checks: overdue? wrong department? missing documents?",
              "AI generates: follow-up email/SMS, strong escalation draft",
              "Shows officer hierarchy: junior → senior → nodal",
              "Citizen sends follow-up automatically",
              "If still no action → next-level escalation",
              "Escalation suggestions: nodal officer, commissioner, MLA grievance cell",
              "System continues tracking status",
              "Department responds due to escalation",
              "Resolution achieved",
              "Citizen confirms 'Resolved'",
              "Dashboard records: number of escalations, time saved, resolution path"
            ]
          },
          {
            title: "Flowchart 3 — Critical issues (safety, water, women safety, govt promises) ⚠️",
            steps: [
              "Citizen reports a critical issue (safety hazard, water crisis, women safety, accident, govt promise broken)",
              "Citizen selects 'Critical Issue'",
              "AI identifies: critical category, urgency, public impact",
              "AI triggers: High-Priority Flag + Urgent Escalation Mode",
              "System maps issue on heatmap as RED zone",
              "AI generates: urgent complaint draft, fastest contact channel, emergency helplines",
              "For governance stakeholders (future phases): ward alerts, CSR partner alerts, cluster detection",
              "Follow-up guidance sent automatically",
              "If unresolved → multi-level escalation",
              "Escalation goes to: Zonal Officer → Commissioner → MLA office",
              "Authorities respond faster due to high-priority flag",
              "Resolution executed",
              "Citizen uploads proof / photo for closure",
              "System marks red hotspot as 'resolved' (turns yellow/green)",
            ]
          }
        ].map((flow, i) => (
          <div 
            key={i}
            style={{
              marginTop: 20,
              borderRadius: 16,
              background: "white",
              boxShadow: "0 6px 28px rgba(0,0,0,0.06)",
              border: "1px solid #eee",
              overflow: "hidden"
            }}
          >
            {/* Title Button */}
            <button 
              onClick={() => setOpenFaq(openFaq === `flow${i}` ? null : `flow${i}`)}
              style={{
                width: "100%",
                padding: "20px",
                background: "#f8fafc",
                border: "none",
                textAlign: "left",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: 18,
                fontWeight: 700,
                color: "#0f172a"
              }}
            >
              {flow.title}

              <div
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  padding: "4px 12px",
                  background: "#0f172a",
                  color: "white",
                  borderRadius: 10
                }}
              >
                {openFaq === `flow${i}` ? "−" : "+"}
              </div>
            </button>

            {/* CONTENT */}
            {openFaq === `flow${i}` && (
              <div style={{ padding: "20px 26px", background: "white" }}>
                {flow.steps.map((s, j) => (
                  <div key={j} style={{ 
                    marginBottom: 18, 
                    padding: 16,
                    borderLeft: "4px solid #1e1e2f",
                    borderRadius: 8,
                    background: "rgba(15,23,42,0.03)",
                    fontSize: 15,
                    color: "#334155",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)" 
                  }}>
                    <span style={{ fontWeight: 700, color: "#0f172a" }}>
                      Step {j + 1} →
                    </span>{" "}
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </section>

      {/* FAQ Accordion */}
      <section style={{ marginTop: 36 }}>
        <h2 style={{ fontSize: 22 }}>Frequently Asked Questions</h2>

        {[
          {
            q: "How does AI decide which department to send to?",
            a: "The AI uses natural language understanding and pattern mapping to map keywords, intent and context to department taxonomy. It can learn from historical labeled data and improve over time.",
          },
          {
            q: "What if the AI is wrong?",
            a: "We always show the AI's suggested department and a draft. The citizen can edit before submission and we capture manual corrections to improve the model.",
          },
          {
            q: "Do you need government permission to start?",
            a: "No — Phase 1 is citizen-facing and requires no integration. Phase 2 adds officer dashboards and optional integrations via MoU/APIs.",
          },
          {
            q: "How do you escalate critical issues?",
            a: "Critical issues are auto-flagged, appear as red zones on the heatmap, and the system suggests direct escalation templates to senior officers and emergency helplines.",
          }
        ].map((f, i) => (
          <div key={i} style={{
            marginTop: 14,
            borderRadius: 12,
            overflow: "hidden",
            border: "1px solid rgba(2,6,23,0.05)",
            background: "white",
            boxShadow: "0 8px 20px rgba(2,6,23,0.03)"
          }}>
            <button
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              style={{
                width: "100%",
                padding: "16px 18px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                textAlign: "left"
              }}
            >
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{f.q}</div>
                <div style={{ marginTop: 6, color: "#94a3b8", fontSize: 13 }}>{openFaq === i ? "Click to collapse" : "Click to expand"}</div>
              </div>
              <div style={{
                marginLeft: 12,
                minWidth: 40,
                height: 40,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: openFaq === i ? "#0f172a" : "#f1f5f9",
                color: openFaq === i ? "white" : "#0f172a",
                fontWeight: 800
              }}>{openFaq === i ? "−" : "+"}</div>
            </button>

            {openFaq === i && (
              <div style={{ padding: 16, borderTop: "1px solid rgba(2,6,23,0.03)", color: "#334155" }}>
                {f.a}
              </div>
            )}
          </div>
        ))}
      </section>

      <footer style={{ marginTop: 40, padding: 18, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
        © CitizEMPOWER • Built for IIM × NSDC × Masai Ideathon • Demo-ready
      </footer>
    </div>
  );
}