import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Header() {
  const isLoggedIn = !!localStorage.getItem("user");
  const location = useLocation();

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
    cursor: "pointer",
  };

  return (
    <header style={headerStyle}>
      <div style={leftSectionStyle}>
        <img src="/logo.png" alt="Logo" style={logoStyle} />
        <span style={titleStyle}>Victim Support Portal</span>
      </div>

      <nav style={navStyle}>
        {isLoggedIn ? (
          <>
            <Link to="/list" style={linkStyle}>Victim</Link>
            <Link to="/CasesPage" style={linkStyle}>Human Rights MIS</Link>
            <Link to="/ReportForm" style={linkStyle}>Reports</Link>
            <span
              onClick={() => {
                localStorage.removeItem("user");
                window.location.href = "/"; 
              }}
              style={linkStyle}
            >
              Logout
            </span>
          </>
        ) : (
          <Link to="/" style={linkStyle}>Login</Link>
        )}
      </nav>
    </header>
  );
}
