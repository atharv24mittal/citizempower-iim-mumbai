import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <div style={{
      width: "100%",
      padding: "15px 20px",
      background: "#1e1e2f",
      color: "white",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20
    }}>
      <h2 style={{ margin: 0 }}>CitizEMPOWER</h2>
      
      <div style={{ display: "flex", gap: "20px" }}>
        <Link style={{ color: "white", textDecoration: "none" }} to="/">Home</Link>
        <Link style={{ color: "white", textDecoration: "none" }} to="/submit">Submit</Link>
        <Link style={{ color: "white", textDecoration: "none" }} to="/dashboard">Dashboard</Link>
      </div>
    </div>
  );
}
