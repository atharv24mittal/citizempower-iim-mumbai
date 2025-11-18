import React, { useState, useEffect } from "react";

export default function SubmitIssue() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [confidence, setConfidence] = useState(0);

  const [showFollowup, setShowFollowup] = useState(false);
  const [showEscalation, setShowEscalation] = useState(false);

  // Autofill from homepage
  useEffect(() => {
    const auto = localStorage.getItem("autofillSample");
    if (auto) {
      setText(auto);
      localStorage.removeItem("autofillSample");
    }
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStep(2);
    setResult(null);

    let c = 0;
    const timer = setInterval(() => {
      c += 8;
      if (c >= 94) clearInterval(timer);
      setConfidence(c);
    }, 140);

    try {
      const res = await fetch("http://localhost:3001/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: text }),
      });

      const data = await res.json();
      setResult({ ...data, confidence: 95 });
      setStep(3);
    } catch (err) {
      alert("Error: " + err.message);
    }

    setLoading(false);
  }

  function downloadPDF() {
    const element = document.createElement("a");
    const file = new Blob([result.draft], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "ComplaintDraft.txt";
    document.body.appendChild(element);
    element.click();
  }

  const quickOptions = [
    {
      emoji: "🤔",
      title: "I don’t know where to go",
      text: "There is dirty stagnant water near my area but I don't know which department is responsible for fixing it.",
      color: "#FDE68A",
    },
    {
      emoji: "😤",
      title: "I'm stuck / no response",
      text: "I submitted a garbage complaint 12 days ago, but no one has responded yet.",
      color: "#BFDBFE",
    },
    {
      emoji: "⚠️",
      title: "Critical / urgent",
      text: "A streetlight has fallen on the road and is posing danger. Needs immediate action.",
      color: "#FECACA",
    },
  ];

  return (
    <div
      style={{
        padding: 20,
        maxWidth: 850,
        margin: "0 auto",
        fontFamily: "Inter",
      }}
    >
      {/* ---- HERO ---- */}
      <div
        style={{
          padding: 24,
          background: "#f1f5f9",
          borderRadius: 18,
          boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
          marginBottom: 30,
        }}
      >
        <h2 style={{ margin: 0, fontSize: 32, fontWeight: 800 }}>
          Submit an Issue
        </h2>
        <p style={{ fontSize: 17, marginTop: 8, color: "#475569" }}>
          AI will identify the correct department, urgency, and generate a
          government-ready complaint draft.
        </p>
      </div>

      {/* ---- PROGRESS ---- */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", marginBottom: 8, fontWeight: 600 }}>
          <div
            style={{
              flex: 1,
              textAlign: "center",
              color: step >= 1 ? "#0f172a" : "#94a3b8",
            }}
          >
            1. Describe
          </div>
          <div
            style={{
              flex: 1,
              textAlign: "center",
              color: step >= 2 ? "#0f172a" : "#94a3b8",
            }}
          >
            2. AI Understanding
          </div>
          <div
            style={{
              flex: 1,
              textAlign: "center",
              color: step >= 3 ? "#0f172a" : "#94a3b8",
            }}
          >
            3. Result
          </div>
        </div>

        <div
          style={{
            height: 8,
            background: "#e2e8f0",
            borderRadius: 20,
          }}
        >
          <div
            style={{
              height: 8,
              width: step === 1 ? "33%" : step === 2 ? "66%" : "100%",
              background: "#0f172a",
              borderRadius: 20,
              transition: "0.6s",
            }}
          />
        </div>
      </div>

      {/* ---- QUICK OPTIONS ---- */}
      <h3 style={{ marginTop: 30 }}>Choose your case type (optional)</h3>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {quickOptions.map((o, i) => (
          <div
            key={i}
            onClick={() => setText(o.text)}
            style={{
              flex: "1 1 30%",
              cursor: "pointer",
              padding: 16,
              background: o.color,
              borderRadius: 16,
              boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
            }}
          >
            <div style={{ fontSize: 30 }}>{o.emoji}</div>
            <div style={{ fontWeight: 700, marginTop: 6 }}>{o.title}</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Click to auto-fill</div>
          </div>
        ))}
      </div>

      {/* ---- FORM ---- */}
      {step === 1 && (
        <form onSubmit={handleSubmit}>
          <label style={{ fontWeight: 600, marginTop: 20 }}>
            Describe your issue
          </label>
          <textarea
            rows="6"
            placeholder="Explain what's happening..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{
              width: "100%",
              padding: 14,
              fontSize: 16,
              borderRadius: 12,
              border: "1px solid #cbd5e1",
              boxShadow: "0 3px 10px rgba(0,0,0,0.04)",
            }}
          />

          <button
            disabled={!text}
            style={{
              marginTop: 14,
              padding: "12px 20px",
              background: "#0f172a",
              color: "white",
              borderRadius: 10,
              fontSize: 17,
              cursor: !text ? "not-allowed" : "pointer",
              opacity: !text ? 0.6 : 1,
              border: "none",
            }}
          >
            Analyze & Triage →
          </button>
        </form>
      )}

      {/* ---- AI PROCESSING ---- */}
      {step === 2 && (
        <div
          style={{
            marginTop: 40,
            padding: 30,
            background: "white",
            borderRadius: 16,
            textAlign: "center",
            boxShadow: "0 6px 22px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              margin: "0 auto",
              border: "6px solid #e2e8f0",
              borderTop: "6px solid #0f172a",
              animation: "spin 1s linear infinite",
            }}
          />

          <h3 style={{ marginTop: 20 }}>AI is analyzing your issue…</h3>
          <p style={{ color: "#475569" }}>
            Understanding context, department mapping, urgency detection…
          </p>

          {/* Confidence */}
          <div style={{ marginTop: 20 }}>
            <div style={{ fontWeight: 700 }}>AI Confidence: {confidence}%</div>
            <div
              style={{
                marginTop: 6,
                height: 8,
                background: "#e2e8f0",
                borderRadius: 10,
              }}
            >
              <div
                style={{
                  width: `${confidence}%`,
                  height: "100%",
                  background: "#0f172a",
                  borderRadius: 10,
                  transition: "0.4s",
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ---- AI RESULT ---- */}
      {step === 3 && result && (
        <div
          style={{
            marginTop: 30,
            padding: 24,
            borderRadius: 18,
            background: "white",
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            animation: "fadeIn 0.6s",
          }}
        >
          <h3 style={{ fontSize: 26 }}>🎉 AI Triage Completed</h3>

          <p><strong>📌 Department:</strong> {result.department}</p>
          <p><strong>📁 Category:</strong> {result.category}</p>

          <p>
            <strong>⚡ Urgency:</strong>{" "}
            <span
              style={{
                padding: "4px 10px",
                borderRadius: 8,
                background:
                  result.urgency === "High"
                    ? "#fee2e2"
                    : result.urgency === "Medium"
                    ? "#fef9c3"
                    : "#dcfce7",
              }}
            >
              {result.urgency}
            </span>
          </p>

          {/* DRAFT */}
          <strong>📄 Complaint Draft:</strong>
          <div
            style={{
              marginTop: 10,
              padding: 16,
              background: "#f8fafc",
              borderRadius: 12,
              whiteSpace: "pre-wrap",
            }}
          >
            {result.draft}
          </div>

          {/* ACTION BUTTONS */}
          <div style={{ marginTop: 18, display: "flex", gap: 12 }}>
            <button
              onClick={() => navigator.clipboard.writeText(result.draft)}
              style={{
                padding: "10px 16px",
                background: "#0f172a",
                color: "white",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
              }}
            >
              Copy Draft 📋
            </button>

            <button
              onClick={downloadPDF}
              style={{
                padding: "10px 16px",
                background: "#334155",
                color: "white",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
              }}
            >
              Download PDF ⬇️
            </button>

            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "10px 16px",
                background: "#0f172a",
                color: "white",
                borderRadius: 10,
                border: "none",
                marginLeft: "auto",
                cursor: "pointer",
              }}
            >
              + New Issue
            </button>
          </div>

          {/* ---- NEXT STEPS ---- */}
          <div
            style={{
              marginTop: 30,
              padding: 20,
              borderRadius: 16,
              background: "#f1f5f9",
              boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
            }}
          >
            <h3 style={{ marginTop: 0 }}>🧭 What to do next?</h3>
            <p style={{ color: "#475569" }}>
              After sending your complaint, here are the recommended actions:
            </p>

            <ul style={{ lineHeight: 1.6 }}>
              <li>Wait for 48–72 hours for a response</li>
              <li>Keep a screenshot of your submission for follow-up</li>
              <li>If no response, escalate using the buttons below</li>
              <li>For urgent issues, contact emergency numbers immediately</li>
            </ul>

            {/* FOLLOW-UP & ESCALATION */}
            <button
              onClick={() => setShowFollowup(!showFollowup)}
              style={{
                marginTop: 10,
                padding: "10px 14px",
                background: "#2563eb",
                color: "white",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
              }}
            >
              Generate Follow-up Email ✉️
            </button>

            {showFollowup && (
              <div
                style={{
                  marginTop: 12,
                  padding: 14,
                  background: "white",
                  borderRadius: 12,
                  boxShadow: "0 4px 14px rgba(0,0,0,0.05)",
                  whiteSpace: "pre-wrap",
                }}
              >
                Dear Sir/Madam,  
                This is a follow-up regarding my previously submitted complaint regarding:  
                "{text}".  
                It has been pending for several days without resolution.  
                Kindly update the status and take required action.  
                Regards.
              </div>
            )}

            <button
              onClick={() => setShowEscalation(!showEscalation)}
              style={{
                marginTop: 14,
                padding: "10px 14px",
                background: "#dc2626",
                color: "white",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
              }}
            >
              Generate Escalation Draft ⚠️
            </button>

            {showEscalation && (
              <div
                style={{
                  marginTop: 12,
                  padding: 14,
                  background: "#fff5f5",
                  borderRadius: 12,
                  whiteSpace: "pre-wrap",
                }}
              >
                **Escalation Draft:**  
                To: Senior Officer / Nodal Officer  
                Subject: URGENT – Escalation for unresolved civic issue  
                
                I want to escalate the issue regarding:  
                "{text}"  
                
                The complaint has not been addressed despite follow-ups.  
                Kindly intervene for immediate resolution.  
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---- Animations ---- */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
}
