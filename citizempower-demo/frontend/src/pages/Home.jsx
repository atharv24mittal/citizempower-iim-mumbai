import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div style={{ padding: 20 }}>
      <h1>CitizEMPOWER — Demo</h1>
      <p>AI-powered grievance triage demo. Start by submitting an issue.</p>
      <Link to="/submit">Submit an issue →</Link>
      <br />
      <Link to="/dashboard">View dashboard →</Link>
    </div>
  );
}
