# 🚀 CitizEMPOWER
### AI-Powered Civic Problem Triage • Follow-up • Escalation • Heatmap Intelligence
### Built for IIM × NSDC × Masai Ideathon (GovTech Track)

---

<div align="center">

🔥 **One Platform. Zero Confusion. 100% Transparency.**  
CitizEMPOWER transforms civic governance by turning ANY citizen complaint into a fully triaged, department-ready, tracked, and escalated case — **in under 3 seconds**, powered by AI.

</div>

---

# 📌 Table of Contents
- Overview
- Why CitizEMPOWER Exists
- What the System Does
- Workflows (Full Lifecycle)
- Features
- Architecture
- Tech Stack
- AI Logic (Triage Engine)
- Screenshots
- HeatmapXII (Advanced Heatmap Engine)
- Installation
- Environment Variables
- API Documentation
- Folder Structure
- (Part 2) Roadmap, Government Integration, License, Credits

---

# 🚀 Overview

CitizEMPOWER is a **full-stack AI-powered civic assistant** designed to modernize the way citizens interact with government systems. It:

✔ Identifies the right government department  
✔ Generates official complaint drafts  
✔ Tracks status & sends reminders  
✔ Auto-escalates if ignored  
✔ Visualizes issues using a live heatmap  
✔ Predicts emerging hotspots  
✔ Gives follow-up guidance & escalation hierarchy  

A single unified platform that improves **transparency**, **efficiency**, and **public trust**.

---

# 🎯 Why CitizEMPOWER Exists

Millions of civic complaints are filed every year in India, but:

- Citizens don't know which department to contact  
- There is no universal grievance interface  
- Departments don’t coordinate  
- Follow-up is confusing  
- Escalation knowledge is low  
- No transparent public dashboard  
- Critical issues don’t get priority  
- No predictive analytics for civic crises  

CitizEMPOWER fixes **all these gaps** with an AI-driven approach.

---

# 💡 What the System Does

## 🧠 1. Smart AI Complaint Understanding  
User types in simple language → AI extracts:

- Department  
- Issue category  
- Urgency level  
- Required documents  
- Draft email/letter  
- Government contact details  

---

## ⚡ 2. Submission + Automated Tracking  
- Issue stored in DB  
- Timeline begins  
- “Pending since X days” reminders  
- Completion confirmation  

---

## 🔁 3. Follow-up Assistance  
If delayed, AI generates:

- Follow-up draft  
- Escalation draft  
- Next-responsible officer  
- Department hierarchy  
- RTI escalation suggestion  

---

## 🚨 4. Critical Issue Pipeline  
High-risk issues are:

- Tagged “Critical”  
- Shown as red-hotspots  
- Escalated faster  
- Highlighted on dashboard  
- Prepared with emergency instructions  

---

## 🗺 5. HeatmapXII Civic Intelligence  
A next-gen civic heatmap system:

- Multi-urgency gradients  
- Satellite & street modes  
- Time-slider (past week)  
- Predictive hotspot detection  
- Ward & pincode analytics  
- Traffic & crowd overlays  
- AI root-cause clustering  

---

# 🔁 Complete Workflow (End-to-End)

## **Flow 1: Citizen Doesn't Know the Department**  
1. Citizen types problem  
2. AI identifies department  
3. AI creates official complaint draft  
4. AI provides submission steps  
5. System tracks issue  
6. AI follows up  
7. AI escalates if ignored  
8. Issue resolved  
9. Dashboard updates  

---

## **Flow 2: Citizen Knows Department but is Stuck**  
1. Citizen enters complaint ID  
2. AI checks timeline  
3. Detects delay  
4. AI suggests follow-up draft  
5. AI provides officer hierarchy  
6. Citizen escalates  
7. Issue resolved  
8. Dashboard logs escalation path  

---

## **Flow 3: Critical Issue (Safety/Emergency)**  
1. Citizen reports critical event  
2. AI marks High/Urgent  
3. Heatmap turns into red cluster  
4. Emergency instructions shown  
5. Auto-escalation prepared  
6. Dashboard reports crisis  
7. Authorities respond  
8. Citizen confirms closure  

---

# ⭐ Features

## ✓ AI-driven department detection  
## ✓ Official complaint drafting  
## ✓ Issue tracking with timeline  
## ✓ Auto follow-up & escalation  
## ✓ Multi-layer HeatmapXII visualization  
## ✓ Predictive analytics  
## ✓ Pincode + ward-based intelligence  
## ✓ Time-based issue visualization  
## ✓ Extreme mode for emergency clusters  
## ✓ Fully responsive frontend  

---

# 🏗 Architecture

┌──────────────────────────────────────────────────┐
│ FRONTEND (React) │
│ • AI submit page │
│ • Dashboard + HeatmapXII │
│ • Follow-up assistant │
└──────────────────────────────────────────────────┘
│ REST API
▼
┌──────────────────────────────────────────────────┐
│ BACKEND (Node.js) │
│ • /api/triage → AI analysis │
│ • /api/dashboard → analytics │
│ • MongoDB (issue storage) │
└──────────────────────────────────────────────────┘
│
▼
┌──────────────────────────────────────────────────┐
│ AI (Groq) │
│ • Department classification │
│ • Urgency detection │
│ • Complaint drafting │
└──────────────────────────────────────────────────┘

---

# 🧰 Tech Stack

**Frontend**  
- React  
- React Router  
- Leaflet + leaflet.heat  
- Custom Heatmap Engine (HeatmapXII)  
- CSS-in-JS styling  

**Backend**  
- Node.js  
- Express  
- MongoDB + Mongoose  

**AI**  
- Groq LLM (fast inference)  
- Prompt-engineered civic logic  

**Deployment**  
- Vercel (frontend)  
- Render/Railway (backend)  
- MongoDB Atlas  

---

# 🧠 AI Logic (Triage Engine)

AI extracts:

| Field | Description |
|-------|-------------|
| **Department** | Correct govt authority |
| **Category** | Road, water, garbage, electricity, etc |
| **Urgency** | Low, Medium, High |
| **Complaint Draft** | Readable, formal English |
| **Documents** | Optional |
| **Timeline** | Expected resolution time |

AI uses:

- Keyword semantic mapping  
- Vector similarity  
- Dept ontology  
- Multi-stage reasoning  
- Response formatting rules  

---

# 🖼 Screenshots (Replace with images later)

📌 Home Page + Flow Carousel
📌 Submit Issue (AI processing + confidence meter)
📌 Triage Output
📌 Dashboard Analytics
📌 HeatmapXII engine
📌 Predictive hotspot view


---

# 🗺 HeatmapXII — Advanced Heatmap Engine

HeatmapXII includes:

🔥 Multi-layer heatmap  
🔥 Red-cluster emergency mode  
🔥 Satellite & street maps  
🔥 Time slider (7 days)  
🔥 Predictive hotspot engine  
🔥 Pincode heat clustering  
🔥 Ward boundary overlays  
🔥 Traffic & route overlays  
🔥 Pulse animation for critical issues  
🔥 AI-based root cause grouping  

---

# ⚙ Installation

## 1. Clone repository

git clone https://github.com/
<your-username>/citizempower.git
cd citizempower


## 2. Backend setup

cd backend
npm install
npm start


## 3. Frontend setup

cd frontend
npm install
npm start


---

# 🔧 Environment Variables

Create `.env` in **backend**:


MONGO_URI=your_mongodb_uri
GROQ_API_KEY=your_groq_api_key
PORT=3001

# 📡 API Documentation

## ➤ POST /api/triage  
AI classification + complaint generation.

### Request Body
```json
{
  "description": "There is a dangerous pothole on MG Road causing accidents."
}


Response
{
  "department": "Road Maintenance",
  "category": "Pothole",
  "urgency": "High",
  "draft": "Respected Sir/Madam, ..."
}

➤ GET /api/dashboard

Returns analytics + issues list.

Response

{
  "total": 12,
  "categoryCount": { "Water": 3, "Road": 5, "Garbage": 4 },
  "deptCount": { "MCGM": 7, "BWSSB": 5 },
  "issues": [ ... ]
}
