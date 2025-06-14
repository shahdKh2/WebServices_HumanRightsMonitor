import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const VictimViewPage = () => {
  const { id } = useParams();
  const [victim, setVictim] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:8000/victims/${id}`).then((res) => setVictim(res.data));
  }, [id]);

  if (!victim) {
    return (
      <div style={{ textAlign: "center", padding: "50px", fontSize: "20px" }}>
        ⏳ Loading victim details...
      </div>
    );
  }

  const containerStyle = {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "30px 20px",
    fontFamily: "Segoe UI, sans-serif",
    color: "#2c3e50",
    backgroundColor: "#f9f9f9",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
  };

  const titleStyle = {
    textAlign: "center",
    marginBottom: "30px",
    fontSize: "24px",
    color: "#34495e",
  };

  const sectionTitleStyle = {
    marginTop: "30px",
    marginBottom: "10px",
    fontSize: "18px",
    borderBottom: "2px solid #ddd",
    paddingBottom: "5px",
  };

  const labelStyle = {
    fontWeight: "bold",
    marginRight: "5px",
  };

  const ulStyle = {
    paddingLeft: "20px",
    margin: 0,
  };

  const liStyle = {
    marginBottom: "6px",
  };

  const infoRowStyle = {
    marginBottom: "10px",
  };

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>👁️ Victim/Witness Details View</h2>

      <div style={infoRowStyle}>
        <span style={labelStyle}>ID:</span> {victim._id}
      </div>
      <div style={infoRowStyle}>
        <span style={labelStyle}>Type:</span> {victim.type === "victim" ? "Victim" : "Witness"}
      </div>
      <div style={infoRowStyle}>
        <span style={labelStyle}>Anonymous:</span> {victim.anonymous ? "Yes" : "No"}
      </div>

      {!victim.anonymous && (
        <>
          <div style={infoRowStyle}>
            <span style={labelStyle}>Email:</span> {victim.contact_info.email}
          </div>
          <div style={infoRowStyle}>
            <span style={labelStyle}>Phone:</span> {victim.contact_info.phone}
          </div>
          <div style={infoRowStyle}>
            <span style={labelStyle}>Secure Messaging:</span> {victim.contact_info.secure_messaging}
          </div>
        </>
      )}

      <div style={sectionTitleStyle}>🧬 Demographics</div>
      <div style={infoRowStyle}>
        <span style={labelStyle}>Gender:</span> {victim.demographics.gender}
      </div>
      <div style={infoRowStyle}>
        <span style={labelStyle}>Age:</span> {victim.demographics.age}
      </div>
      <div style={infoRowStyle}>
        <span style={labelStyle}>Occupation:</span> {victim.demographics.occupation}
      </div>
      <div style={infoRowStyle}>
        <span style={labelStyle}>Ethnicity:</span> {victim.demographics.ethnicity}
      </div>

      <div style={sectionTitleStyle}>⚠️ Risk Assessment</div>
      <div style={infoRowStyle}>
        <span style={labelStyle}>Level:</span> {victim.risk_assessment.level}
      </div>
      <div style={infoRowStyle}>
        <span style={labelStyle}>Threats:</span>{" "}
        {victim.risk_assessment.threats?.length
          ? victim.risk_assessment.threats.join(", ")
          : "None"}
      </div>
      <div style={infoRowStyle}>
        <span style={labelStyle}>Protection Needed:</span>{" "}
        {victim.risk_assessment.protection_needed ? "Yes" : "No"}
      </div>

      <div style={sectionTitleStyle}>📁 Associated Cases</div>
      <ul style={ulStyle}>
        {(victim.cases_involved || []).map((c, i) => (
          <li key={i} style={liStyle}>
            <a href={`/CasesPage`} style={{ color: "#3498db", textDecoration: "none" }}>
              Case #{c}
            </a>
          </li>
        ))}
      </ul>

      <div style={sectionTitleStyle}>💡 Support Services Provided</div>
      <ul style={ulStyle}>
        {(victim.support_services || []).map((s, i) => (
          <li key={i} style={liStyle}>
            {s.type} – {s.provider} ({s.status})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VictimViewPage;
