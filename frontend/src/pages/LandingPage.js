// pages/LandingPage.js
import React from "react";

export default function LandingPage() {
  const containerStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "2rem",
  };

  const leftStyle = {
    flex: 1,
    color: "#281E30",
    fontSize: "3rem",
    fontWeight: "bold",
  };

  const sentenceStyle = {
    fontSize: "1rem",
    fontWeight: "normal",
    marginTop: "1.5rem",
    color: "#444",
  };

  const rightStyle = {
    flex: 1,
    display: "flex",
    justifyContent: "center",
  };

  const imageStyle = {
    maxWidth: "80%",
    height: "auto",
    borderRadius: "10px",
  };

  return (
    <div style={containerStyle}>
      <div style={leftStyle}>
        Victim Support Portal
        <div style={sentenceStyle}>
          Empowering and supporting victims and witnesses with integrity and care.
        </div>
      </div>
      <div style={rightStyle}>
        <img src="/landingPage.png" alt="Landing" style={imageStyle} />
      </div>
    </div>
  );
}
