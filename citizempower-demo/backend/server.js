import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import mongoose from "mongoose";
import Issue from "./models/Issue.js";

// Load environment variables FIRST
dotenv.config();

// Debug check
console.log("GROQ API KEY LOADED:", process.env.GROQ_API_KEY ? "YES" : "NO");
console.log("Mongo URL Loaded:", process.env.MONGO_URL ? "YES" : "NO");

// ------------------- MONGODB CONNECTION -------------------
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("Mongo error:", err));

// ------------------- EXPRESS SETUP -------------------
const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

// ------------------- GROQ CLIENT -------------------
const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Function to generate random coordinates around Mumbai
function randomCoordinates() {
  const lat = 19.07 + Math.random() * 0.08; // 19.07 to 19.15
  const lng = 72.85 + Math.random() * 0.08; // 72.85 to 72.93
  return { lat, lng };
}

// ------------------- TRIAGE API -------------------
app.post("/api/triage", async (req, res) => {
  try {
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({ error: "Description missing" });
    }

    const prompt = `
You are an AI civic governance assistant.
Given a citizen's issue, return output in EXACT this format:

Department: <department name>
Category: <issue category>
Urgency: <Low/Medium/High>
Draft: <formal government complaint draft>

Problem: "${description}"
`;

    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You classify Indian civic issues and generate official complaint drafts for government departments.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
    });

    const text = completion.choices[0].message.content;

    // Parse fields from AI response
    const result = {
      description,
      department: text.match(/Department:(.*)/i)?.[1]?.trim() || "Not identified",
      category: text.match(/Category:(.*)/i)?.[1]?.trim() || "General",
      urgency: text.match(/Urgency:(.*)/i)?.[1]?.trim() || "Medium",
      draft: text.match(/Draft:(.*)/is)?.[1]?.trim() || text,
    };

    // Generate random map coordinates
    const { lat, lng } = randomCoordinates();
    result.lat = lat;
    result.lng = lng;

    // SAVE TO DATABASE
    await Issue.create(result);

    res.json(result);
  } catch (error) {
    console.error("GROQ API ERROR:", error);
    return res.status(500).json({ error: "AI failed", details: error.message });
  }
});

// ------------------- DASHBOARD API -------------------
app.get("/api/dashboard", async (req, res) => {
  try {
    const issues = await Issue.find().sort({ createdAt: -1 });

    const total = issues.length;

    const categoryCount = {};
    const deptCount = {};

    issues.forEach((i) => {
      categoryCount[i.category] = (categoryCount[i.category] || 0) + 1;
      deptCount[i.department] = (deptCount[i.department] || 0) + 1;
    });

    res.json({
      total,
      categoryCount,
      deptCount,
      issues,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ error: "Failed to load dashboard" });
  }
});

// ------------------- START SERVER -------------------
app.listen(process.env.PORT, () => {
  console.log("Backend running on port", process.env.PORT);
});
