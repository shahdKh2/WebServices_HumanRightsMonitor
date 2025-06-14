import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const VictimList = () => {
  const [victims, setVictims] = useState([]);
  const [cases, setCases] = useState([]); // For cases list
  const [filters, setFilters] = useState({ type: "", risk: "", case: "" });
  const navigate = useNavigate();

  // Fetch all cases on mount for the selector
  useEffect(() => {
    axios.get("http://localhost:8000/cases") // Assuming this endpoint returns all cases with id and title
      .then((res) => setCases(res.data))
      .catch(() => setCases([]));
  }, []);

  // Fetch victims: 
  // If case filter is set, fetch victims linked to that case only.
  // Otherwise fetch all victims.
  useEffect(() => {
    if (filters.case) {
      axios.get(`http://localhost:8000/victims/case/${filters.case}`)
        .then((res) => setVictims(res.data))
        .catch(() => setVictims([]));
    } else {
      axios.get("http://localhost:8000/victims")
        .then((res) => setVictims(res.data))
        .catch(() => setVictims([]));
    }
  }, [filters.case]); // Re-run when case filter changes

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Filter victims by type and risk locally (case filter handled by API)
  const filtered = victims.filter((v) => {
    return (
      (filters.type === "" || v.type === filters.type) &&
      (filters.risk === "" || v.risk_assessment?.level === filters.risk)
    );
  });

const containerStyle = {
    maxWidth: "100%",
    padding: "40px",
    margin: "0 auto",
    fontFamily: "Arial, sans-serif",
  };

  const titleStyle = {
    textAlign: "center",
    marginBottom: "30px",
    color: "#2c3e50",
  };

  const buttonStyle = {
    padding: "10px 20px",
    backgroundColor: "#98768E",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  };

  const filtersStyle = {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginBottom: "20px",
    flexWrap: "wrap",
  };

  const selectStyle = {
    padding: "8px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    minWidth: "140px",
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "center",
  };

  const thStyle = {
    backgroundColor: "#281E30",
    color: "white",
    padding: "10px",
    border: "1px solid #ddd",
  };

  const tdStyle = {
    padding: "10px",
    border: "1px solid #ddd",
  };

  const viewBtnStyle = {
    backgroundColor: "transparent",
    color: "white",
    padding: "5px 10px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  };

  const editBtnStyle = {
    backgroundColor: "transparent",
    color: "black",
    padding: "5px 10px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  };
  
  return (
    <div style={{ maxWidth: "100%", padding: "40px", margin: "0 auto", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ textAlign: "center", marginBottom: "30px", color: "#2c3e50" }}>🧩 Victim/Witness Management</h2>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
        <button
          style={{ padding: "10px 20px", backgroundColor: "#98768E", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
          onClick={() => navigate("/add")}
        >
          ➕ Add New Victim/Witness
        </button>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
          <select name="type" onChange={handleFilterChange} value={filters.type} style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ccc", minWidth: "140px" }}>
            <option value="">All Types</option>
            <option value="victim">Victim</option>
            <option value="witness">Witness</option>
          </select>

          <select name="risk" onChange={handleFilterChange} value={filters.risk} style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ccc", minWidth: "140px" }}>
            <option value="">All Risk Levels</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          {/* New case filter */}
          <select name="case" onChange={handleFilterChange} value={filters.case} style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ccc", minWidth: "180px" }}>
            <option value="">All Cases</option>
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "center" }}>
        <thead>
          <tr>
            <th style={{ backgroundColor: "#281E30", color: "white", padding: "10px", border: "1px solid #ddd" }}>Alias / ID</th>
            <th style={{ backgroundColor: "#281E30", color: "white", padding: "10px", border: "1px solid #ddd" }}>Type</th>
            <th style={{ backgroundColor: "#281E30", color: "white", padding: "10px", border: "1px solid #ddd" }}>Gender</th>
            <th style={{ backgroundColor: "#281E30", color: "white", padding: "10px", border: "1px solid #ddd" }}>Age</th>
            <th style={{ backgroundColor: "#281E30", color: "white", padding: "10px", border: "1px solid #ddd" }}>Risk</th>
            <th style={{ backgroundColor: "#281E30", color: "white", padding: "10px", border: "1px solid #ddd" }}>Status</th>
            <th style={{ backgroundColor: "#281E30", color: "white", padding: "10px", border: "1px solid #ddd" }}>View</th>
            <th style={{ backgroundColor: "#281E30", color: "white", padding: "10px", border: "1px solid #ddd" }}>Edit</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length > 0 ? (
            filtered.map((v) => (
              <tr key={v.id}>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{v.pseudonym || v.id}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{v.type === "victim" ? "Victim" : "Witness"}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{v.demographics?.gender || "-"}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{v.demographics?.age || "-"}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{v.risk_assessment?.level || "N/A"}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>Active</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  <button style={{ backgroundColor: "transparent", color: "white", padding: "5px 10px", border: "none", borderRadius: "4px", cursor: "pointer" }} onClick={() => navigate(`/view/${v.id}`)}>👁️</button>
                </td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  <button style={{ backgroundColor: "transparent", color: "black", padding: "5px 10px", border: "none", borderRadius: "4px", cursor: "pointer" }} onClick={() => navigate(`/edit/${v.id}`)}>✏️</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" style={{ padding: "10px", border: "1px solid #ddd", color: "#888" }}>No victims or witnesses found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default VictimList;
