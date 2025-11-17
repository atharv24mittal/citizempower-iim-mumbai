import mongoose from "mongoose";

const IssueSchema = new mongoose.Schema({
  description: String,
  department: String,
  category: String,
  urgency: String,
  draft: String,

  // 🔥 NEW FIELDS FOR HEATMAP
  lat: Number,
  lng: Number,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Issue", IssueSchema);
