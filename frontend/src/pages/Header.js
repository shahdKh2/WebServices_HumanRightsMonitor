import React from "react";
import { Link } from "react-router-dom";

export default function Header() {
  const headerStyle = {
    backgroundColor: "#281E30",
    color: "#F6D4CF",
    padding: "1rem 2rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  };

  const leftSectionStyle = {
    display: "flex",
    alignItems: "center",
  };

  const logoStyle = {
    height: "40px",
    marginRight: "10px",
  };

  const titleStyle = {
    fontSize: "1.5rem",
    fontWeight: "bold",
  };

  const navStyle = {
    display: "flex",
    gap: "15px",
  };

  const linkStyle = {
    color: "#F6D4CF",
    textDecoration: "none",
    fontWeight: "normal",
    fontSize: "1rem",
  };

  return (
    <header style={headerStyle}>
      <div style={leftSectionStyle}>
        <img src="/logo.png" alt="Logo" style={logoStyle} />
        <span style={titleStyle}>Victim Support Portal</span>
      </div>
      <nav style={navStyle}>
        <Link to="/list" style={linkStyle}>Victim List</Link>
        <Link to="/CasesPage" style={linkStyle}>Human Rights MIS</Link>
      </nav>
    </header>
  );
}
