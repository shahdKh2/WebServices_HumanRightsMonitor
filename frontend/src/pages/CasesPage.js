import React, { useState, useEffect } from "react";
import axios from "axios";

const colors = {
  background: "#F6D4CF",
  card: "#D3B8C5",
  header: "#281E30",
  text: "#281E30",
  button: "#98768E",
};

const inputStyle = {
  width: "100%",
  padding: "0.8rem",
  marginBottom: "0.75rem",
  borderRadius: "10px",
  border: "1px solid #ccc",
  fontSize: "1rem",
};

const CasesPage = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "new",
    priority: "high",
    country: "",
    region: "",
    violation_type: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [cases, setCases] = useState([]);

  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [caseDetails, setCaseDetails] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState("");
  const [evidenceFile, setEvidenceFile] = useState(null);

  const [filterCountry, setFilterCountry] = useState("");
  const [filterViolationType, setFilterViolationType] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  const [menuOpenIndex, setMenuOpenIndex] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState(null);

  const [showFilters, setShowFilters] = useState(false);
  const [searchTitle, setSearchTitle] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    fetchCases();
  }, [submitted]);

  const fetchCases = async () => {
    const res = await axios.get("http://127.0.0.1:8000/cases/");
    const visibleCases = res.data.filter((c) => c.status !== "archived");
    setCases(visibleCases);
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const now = new Date().toISOString();

    const caseData = {
      title: formData.title,
      description: formData.description,
      status: formData.status,
      priority: formData.priority,
      violation_types: [formData.violation_type],
      location: {
        country: formData.country,
        region: formData.region,
        coordinates: { type: "Point", coordinates: [36.5, 37.1] },
      },
      date_occurred: now,
      date_reported: now,
      victims: [],
      perpetrators: [],
      evidence: [],
      created_by: "student-1",
      created_at: now,
      updated_at: now,
    };

    try {
      const res = await axios.post("http://127.0.0.1:8000/cases/", caseData);
      const newCaseId = res.data.id; // ✅ Use backend-generated ID

      if (evidenceFile) {
        const form = new FormData();
        form.append("file", evidenceFile);
        await axios.post(
          `http://127.0.0.1:8000/cases/${newCaseId}/upload/`,
          form,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        await fetchCases();
      }

      setSubmitted(true);
      setFormData({
        title: "",
        description: "",
        status: "new",
        priority: "high",
        country: "",
        region: "",
        violation_type: "",
      });
    } catch (err) {
      console.error("Submit error:", err.response?.data || err.message);
    }
  };

  const fetchCaseById = async () => {
    if (!selectedCaseId) return;
    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/cases/${selectedCaseId}`
      );
      setCaseDetails(res.data);
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("❌ Case not found");
    }
  };

  const updateStatus = async () => {
    try {
      await axios.patch(`http://127.0.0.1:8000/cases/${selectedCaseId}`, {
        status: statusUpdate,
      });
      alert("✅ Status updated");
      fetchCases();
    } catch (err) {
      console.error("Status Update Error:", err.response?.data || err.message);
    }
  };

  const deleteCase = async () => {
    try {
      await axios.delete(`http://127.0.0.1:8000/cases/${selectedCaseId}`);
      alert("🗑️ Case deleted");
      fetchCases();
      setCaseDetails(null);
    } catch (err) {
      console.error("Delete Error:", err.response?.data || err.message);
    }
  };

  const uploadEvidence = async () => {
    if (!evidenceFile) return;
    const form = new FormData();
    form.append("file", evidenceFile);
    try {
      await axios.post(
        `http://127.0.0.1:8000/cases/${selectedCaseId}/upload/`,
        form,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      alert("📎 File uploaded");
      setEvidenceFile(null);
    } catch (err) {
      console.error("Upload Error:", err.response?.data || err.message);
    }
  };

  const searchCases = async () => {
    try {
      let query = "";

      if (searchTitle.startsWith("HRM-")) {
        query = `case_id=${searchTitle}`;
      } else if (searchTitle.trim()) {
        query = `title=${searchTitle}`;
      }

      const res = await axios.get(
        `http://127.0.0.1:8000/cases/search/?${query}`
      );
      setCases(res.data);
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("❌ No cases found.");
    }
  };

  const filterCases = async () => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("location", filterCountry);
      if (filterViolationType)
        queryParams.append("violation_type", filterViolationType);
      if (filterStartDate) {
        queryParams.append("start_date", filterStartDate);
        // queryParams.append("end_date", filterEndDate);
      }
      if (filterStatus) queryParams.append("status", filterStatus);
      if (filterPriority) queryParams.append("priority", filterPriority);
      const res = await axios.get(
        `http://127.0.0.1:8000/cases/?${queryParams}`
      );
      setCases(res.data);
    } catch (err) {
      console.error("Filter Error:", err.response?.data || err.message);
    }
  };

  const resetFilters = async () => {
    setFilterCountry("");
    setFilterViolationType("");
    setFilterStatus("");
    setFilterPriority("");
    setFilterStartDate("");
    await fetchCases(); // show all cases
  };

  return (
    <div
      style={{
        background: colors.background,
        minHeight: "100vh",
        padding: "3rem 2rem",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          width: "50%",
          display: "flex",
          flexWrap: "wrap",
          gap: "2rem",
          color: colors.text,
        }}
      >
        {/* Manage Case */}
        <div
          style={{
            flexBasis: "100%",
            background: "#fff",
            padding: "2rem",
            borderRadius: "12px",
          }}
        >
          <h3 style={{ color: colors.header }}>🔍 Manage Case</h3>
          <input
            placeholder="Search by Case ID or Title"
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
            style={inputStyle}
          />

          <button onClick={searchCases} style={inputStyle}>
            🔎 Search Case(s)
          </button>
        </div>
        {/* View Cases */}
        <div style={{ flex: 1, minWidth: "300px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              width: "100%",
            }}
          >
            {" "}
            <h2 style={{ color: colors.header }}> Existing Cases</h2>
            <img
              src="/plus.png"
              alt="Add New"
              style={{ width: "28px", height: "28px", cursor: "pointer" }}
              title="Add New Case"
              onClick={() => setAddModalOpen(true)}
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: "1rem",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            {/* Show Filters + Refresh buttons here */}

            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                ...inputStyle,
                background: colors.button,
                color: "white",
                fontWeight: "bold",
                flex: 1,
              }}
            >
              {showFilters ? " Hide Filters" : " Show Filters"}
            </button>

            <button
              onClick={resetFilters}
              title="Reset Filters"
              style={{
                padding: "0.8rem",
                cursor: "pointer",
                background: "none",
                border: "none",
                outline: "none",
              }}
            >
              <img
                src="/refresh.png"
                alt="Refresh"
                style={{ width: "35px", height: "35px" }}
              />
            </button>
          </div>

          {showFilters && (
            <div style={{ marginBottom: "1rem" }}>
              <h3 style={{ color: colors.header }}>📌 Filter Cases</h3>

              <input
                placeholder="Country or Region"
                value={filterCountry}
                onChange={(e) => setFilterCountry(e.target.value)}
                style={inputStyle}
              />

              <select
                value={filterViolationType}
                onChange={(e) => setFilterViolationType(e.target.value)}
                style={inputStyle}
              >
                <option value="">Violation Type</option>
                <option value="forced_displacement">Forced Displacement</option>
                <option value="arbitrary_detention">Arbitrary Detention</option>
                <option value="torture">Torture</option>
                <option value="freedom_of_expression">
                  Freedom of Expression
                </option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={inputStyle}
              >
                <option value="">Status</option>
                <option value="new">New</option>
                <option value="under_investigation">Under Investigation</option>
                <option value="resolved">Resolved</option>
              </select>

              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                style={inputStyle}
              >
                <option value="">Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                style={inputStyle}
              />

              <button
                onClick={async () => {
                  try {
                    const res = await axios.get("http://127.0.0.1:8000/cases/");
                    const archivedCases = res.data.filter(
                      (c) => c.status === "archived"
                    );
                    setCases(archivedCases);
                    setShowArchived(true);
                  } catch (err) {
                    console.error("Fetch Archived Error:", err);
                  }
                }}
                style={{
                  ...inputStyle,
                  background: "#999",
                  color: "white",
                  fontWeight: "bold",
                  marginTop: "0.5rem",
                }}
              >
                📦 Show Archived Cases
              </button>

              <button onClick={filterCases} style={inputStyle}>
                Apply Filters
              </button>
            </div>
          )}

          {cases.length === 0 ? (
            <p
              style={{
                textAlign: "center",
                marginTop: "2rem",
                color: colors.header,
                fontSize: "1.1rem",
                background: "#fff",
                padding: "1rem",
                borderRadius: "12px",
              }}
            >
              🕊️ No cases to display yet <br />
              Try adding a new case or adjusting your filters.
            </p>
          ) : (
            cases.map((c, idx) => (
              <div
                key={idx}
                style={{
                  background: colors.card,
                  marginBottom: "1rem",
                  padding: "1rem",
                  borderRadius: "12px",
                  position: "relative",
                }}
              >
                {/* More icon */}
                <div
                  style={{ position: "absolute", top: "1rem", right: "1rem" }}
                >
                  <img
                    src="/more.png"
                    alt="Options"
                    style={{ width: "24px", height: "24px", cursor: "pointer" }}
                    onClick={() =>
                      setMenuOpenIndex(menuOpenIndex === idx ? null : idx)
                    }
                  />
                  {menuOpenIndex === idx && (
                    <div
                      style={{
                        position: "absolute",
                        top: "2.5rem",
                        right: 0,
                        background: "#fff",
                        border: "1px solid #ccc",
                        borderRadius: "8px",
                        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                        zIndex: 10,
                      }}
                    >
                      <button
                        onClick={() => {
                          setEditingCase(c);
                          setEditModalOpen(true);
                          setMenuOpenIndex(null);
                        }}
                        style={{
                          padding: "0.5rem 1rem",
                          background: "none",
                          border: "none",
                          width: "100%",
                          textAlign: "left",
                          cursor: "pointer",
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={async () => {
                          setMenuOpenIndex(null);
                          if (
                            window.confirm(
                              "Are you sure you want to delete this case?"
                            )
                          ) {
                            try {
                              await axios.delete(
                                `http://127.0.0.1:8000/cases/${c.case_id}`
                              );
                              alert("🗑️ Case deleted");
                              fetchCases();
                            } catch (err) {
                              console.error(
                                "Delete Error:",
                                err.response?.data || err.message
                              );
                            }
                          }
                        }}
                        style={{
                          padding: "0.5rem 1rem",
                          background: "none",
                          border: "none",
                          width: "100%",
                          textAlign: "left",
                          cursor: "pointer",
                          color: "#aa3333",
                        }}
                      >
                        Delete
                      </button>
                      {/* ---------------------------  */}
                      <button
                        onClick={async () => {
                          setMenuOpenIndex(null);
                          if (
                            window.confirm(
                              "Are you sure you want to archive this case?"
                            )
                          ) {
                            try {
                              await axios.patch(
                                `http://127.0.0.1:8000/cases/${c.case_id}/archive`
                              );
                              alert("📦 Case archived");
                              fetchCases(); // Refresh the list
                            } catch (err) {
                              console.error(
                                "Archive Error:",
                                err.response?.data || err.message
                              );
                              alert("❌ Failed to archive the case");
                            }
                          }
                        }}
                        style={{
                          padding: "0.5rem 1rem",
                          background: "none",
                          border: "none",
                          width: "100%",
                          textAlign: "left",
                          cursor: "pointer",
                          color: "#aa3333",
                        }}
                      >
                        Archive
                      </button>
                    </div>
                  )}
                </div>
                {/* **************************************** */}
                {showArchived && c.status === "archived" && (
                  <button
                    onClick={async () => {
                      try {
                        await axios.patch(
                          `http://127.0.0.1:8000/cases/${c.case_id}`,
                          { status: "new" } // or any status you want to restore to
                        );
                        alert("✅ Case restored");
                        fetchCases();
                        setShowArchived(false);
                      } catch (err) {
                        console.error(
                          "Restore Error:",
                          err.response?.data || err.message
                        );
                        alert("❌ Failed to restore case");
                      }
                    }}
                    style={{
                      marginTop: "0.5rem",
                      padding: "0.5rem",
                      background: colors.button,
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                    }}
                  >
                    ♻️ Restore
                  </button>
                )}

                {/* **************************************** */}
                {/* Card content */}
                <h4>{c.title}</h4>
                <p>
                  <strong>ID:</strong> {c.case_id}
                </p>
                <p>
                  <strong>Description:</strong> {c.description}
                </p>
                <p>
                  <strong>Violation Type:</strong> {c.violation_types}
                </p>
                <p>
                  <strong>Date Occurred:</strong>{" "}
                  {new Date(c.date_occurred).toLocaleDateString()}
                </p>
                <p>
                  <strong>Status:</strong> {c.status} |{" "}
                  <strong>Priority:</strong> {c.priority}
                </p>
                <p>
                  <strong>Location:</strong> {c.location?.region},{" "}
                  {c.location?.country}
                </p>

                {c.evidence?.length > 0 && (
                  <div style={{ marginTop: "1rem" }}>
                    <strong>Evidence:</strong>
                    <div>
                      {c.evidence.map((fileUrl, i) => {
                        if (typeof fileUrl !== "string") return null; // 🚨 prevent .match crash
                        const fullUrl = `http://127.0.0.1:8000${fileUrl}`;

                        if (fileUrl.match(/\.(jpeg|jpg|png|gif)$/i)) {
                          return (
                            <img
                              key={i}
                              src={fullUrl}
                              alt={`Evidence ${i + 1}`}
                              style={{
                                width: "100%",
                                maxHeight: "200px",
                                objectFit: "cover",
                                marginTop: "0.5rem",
                                borderRadius: "8px",
                              }}
                            />
                          );
                        } else if (fileUrl.match(/\.(mp4|webm|ogg)$/i)) {
                          return (
                            <video
                              key={i}
                              controls
                              src={fullUrl}
                              style={{
                                width: "100%",
                                maxHeight: "250px",
                                marginTop: "0.5rem",
                                borderRadius: "8px",
                              }}
                            />
                          );
                        } else if (fileUrl.match(/\.pdf$/i)) {
                          return (
                            <a
                              key={i}
                              href={fullUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ display: "block", marginTop: "0.5rem" }}
                            >
                              📄 View PDF Evidence {i + 1}
                            </a>
                          );
                        }

                        return null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Add Case */}
        {addModalOpen && (
          <div
            style={{
              position: "fixed",
              top: "0",
              left: "0",
              width: "100vw",
              height: "100vh",
              background: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 999,
            }}
          >
            <div
              style={{
                background: colors.card,
                padding: "2rem",
                borderRadius: "16px",
                width: "90%",
                maxWidth: "400px",
                height: "90vh",
                overflowY: "auto",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <h2 style={{ color: colors.header }}>Add New Case</h2>
              </div>
              {/* {submitted && <p style={{ color: "green" }}> Case added!</p>} */}
              <form
                onSubmit={(e) => {
                  handleSubmit(e);
                  setAddModalOpen(false);
                }}
              >
                {" "}
                <label
                  style={{
                    display: "block",
                    marginTop: "1rem",
                    fontWeight: "bold",
                  }}
                >
                  Case Title
                  <input
                    type="text"
                    name="title"
                    placeholder="Enter case title"
                    value={formData.title}
                    onChange={handleChange}
                    style={inputStyle}
                    required
                  />
                </label>
                <label
                  style={{
                    display: "block",
                    marginTop: "1rem",
                    fontWeight: "bold",
                  }}
                >
                  Description
                  <textarea
                    name="description"
                    placeholder="Describe the human rights violation..."
                    value={formData.description}
                    onChange={handleChange}
                    style={inputStyle}
                    required
                  />
                </label>
                <label
                  style={{
                    display: "block",
                    marginTop: "1rem",
                    fontWeight: "bold",
                  }}
                >
                  Status
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    style={inputStyle}
                  >
                    <option value="new">New</option>
                    <option value="under_investigation">
                      Under Investigation
                    </option>
                    <option value="resolved">Resolved</option>
                  </select>
                </label>
                <label
                  style={{
                    display: "block",
                    marginTop: "1rem",
                    fontWeight: "bold",
                  }}
                >
                  Violation Type
                  <select
                    name="violation_type"
                    value={formData.violation_type || ""}
                    onChange={handleChange}
                    style={inputStyle}
                    required
                  >
                    <option value="">Select Violation Type</option>
                    <option value="forced_displacement">
                      Forced Displacement
                    </option>
                    <option value="arbitrary_detention">
                      Arbitrary Detention
                    </option>
                    <option value="torture">Torture</option>
                    <option value="freedom_of_expression">
                      Freedom of Expression
                    </option>
                  </select>
                </label>
                <label
                  style={{
                    display: "block",
                    marginTop: "1rem",
                    fontWeight: "bold",
                  }}
                >
                  Priority
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    style={inputStyle}
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </label>
                <label
                  style={{
                    display: "block",
                    marginTop: "1rem",
                    fontWeight: "bold",
                  }}
                >
                  Country
                  <input
                    type="text"
                    name="country"
                    placeholder="Enter country name"
                    value={formData.country}
                    onChange={handleChange}
                    style={inputStyle}
                    required
                  />
                </label>
                <label
                  style={{
                    display: "block",
                    marginTop: "1rem",
                    fontWeight: "bold",
                  }}
                >
                  Region
                  <input
                    type="text"
                    name="region"
                    placeholder="Enter region or city"
                    value={formData.region}
                    onChange={handleChange}
                    style={inputStyle}
                    required
                  />
                </label>
                <label
                  style={{
                    display: "block",
                    marginTop: "1rem",
                    fontWeight: "bold",
                  }}
                >
                  Attach Evidence (PDF/Image/Video)
                  <input
                    type="file"
                    onChange={(e) => setEvidenceFile(e.target.files[0])}
                    style={inputStyle}
                    accept=".pdf,image/*,video/*"
                  />
                </label>
                <button
                  type="submit"
                  style={{
                    ...inputStyle,
                    marginTop: "1.5rem",
                    background: colors.button,
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  Add Case
                </button>{" "}
                <button
                  onClick={() => setAddModalOpen(false)}
                  style={{
                    ...inputStyle,
                    background: "#aaa",
                    color: "white",
                    marginTop: "0.5rem",
                  }}
                  type="button"
                >
                  Cancel
                </button>
              </form>
            </div>{" "}
          </div>
        )}
        {editModalOpen && editingCase && (
          <div
            style={{
              position: "fixed",
              top: "0",
              left: "0",
              width: "100vw",
              height: "100vh",
              background: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 999,
            }}
          >
            <div
              style={{
                background: "#fff",
                padding: "2rem",
                borderRadius: "16px",
                width: "90%",
                maxWidth: "500px",
                maxHeight: "80vh",
                overflowY: "auto",
              }}
            >
              <h3>Edit {editingCase.title} Case</h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    const updatedCase = {
                      title: editingCase.title,
                      description: editingCase.description,
                      status: editingCase.status,
                      priority: editingCase.priority,
                      violation_types: editingCase.violation_types,
                      location: {
                        country: editingCase.location.country,
                        region: editingCase.location.region,
                      },
                    };

                    // Update the case details
                    await axios.patch(
                      `http://127.0.0.1:8000/cases/${editingCase.case_id}`,
                      updatedCase
                    );

                    // Upload file if selected
                    if (evidenceFile) {
                      const form = new FormData();
                      form.append("file", evidenceFile);
                      await axios.post(
                        `http://127.0.0.1:8000/cases/${editingCase.case_id}/upload/`,
                        form,
                        {
                          headers: {
                            "Content-Type": "multipart/form-data",
                          },
                        }
                      );
                      // alert(" New evidence uploaded");
                      setEvidenceFile(null); // Clear after upload
                    }

                    alert("✅ Case updated");
                    setEditModalOpen(false);
                    fetchCases();
                  } catch (err) {
                    console.error(
                      "Update Error:",
                      err.response?.data || err.message
                    );
                    alert("❌ Failed to update case");
                  }
                }}
              >
                <label>
                  <strong>Title</strong>
                  <input
                    value={editingCase.title}
                    onChange={(e) =>
                      setEditingCase({ ...editingCase, title: e.target.value })
                    }
                    style={inputStyle}
                  />
                </label>

                <label>
                  <strong>Description</strong>
                  <textarea
                    value={editingCase.description}
                    onChange={(e) =>
                      setEditingCase({
                        ...editingCase,
                        description: e.target.value,
                      })
                    }
                    style={inputStyle}
                    placeholder="Description"
                    required
                  />
                </label>

                <label>
                  <strong>Country</strong>
                  <input
                    type="text"
                    value={editingCase.location.country}
                    onChange={(e) =>
                      setEditingCase({
                        ...editingCase,
                        location: {
                          ...editingCase.location,
                          country: e.target.value,
                        },
                      })
                    }
                    style={inputStyle}
                    placeholder="Country"
                    required
                  />
                </label>

                <label>
                  <strong>Region</strong>
                  <input
                    type="text"
                    value={editingCase.location.region}
                    onChange={(e) =>
                      setEditingCase({
                        ...editingCase,
                        location: {
                          ...editingCase.location,
                          region: e.target.value,
                        },
                      })
                    }
                    style={inputStyle}
                    placeholder="Region"
                    required
                  />
                </label>
                <label>
                  <strong>Status</strong>
                  <select
                    value={editingCase.status}
                    onChange={(e) =>
                      setEditingCase({ ...editingCase, status: e.target.value })
                    }
                    style={inputStyle}
                  >
                    <option value="new">New</option>
                    <option value="under_investigation">
                      Under Investigation
                    </option>
                    <option value="resolved">Resolved</option>
                  </select>
                </label>

                <label>
                  <strong>Violation Type</strong>
                  <select
                    value={editingCase.violation_types?.[0] || ""}
                    onChange={(e) =>
                      setEditingCase({
                        ...editingCase,
                        violation_types: [e.target.value],
                      })
                    }
                    style={inputStyle}
                    required
                  >
                    <option value="">Select Violation Type</option>
                    <option value="forced_displacement">
                      Forced Displacement
                    </option>
                    <option value="arbitrary_detention">
                      Arbitrary Detention
                    </option>
                    <option value="torture">Torture</option>
                    <option value="freedom_of_expression">
                      Freedom of Expression
                    </option>
                  </select>
                </label>

                <label>
                  <strong>Priority</strong>
                  <select
                    value={editingCase.priority}
                    onChange={(e) =>
                      setEditingCase({
                        ...editingCase,
                        priority: e.target.value,
                      })
                    }
                    style={inputStyle}
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </label>

                <label>
                  <strong>Update Evidence (PDF/Image/Video)</strong>
                  <input
                    type="file"
                    accept=".pdf,image/*,video/*"
                    onChange={(e) => setEvidenceFile(e.target.files[0])}
                    style={inputStyle}
                  />
                </label>

                <button
                  type="submit"
                  style={{
                    ...inputStyle,
                    background: colors.button,
                    color: "white",
                  }}
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditModalOpen(false)}
                  style={{ ...inputStyle, background: "#aaa", color: "white" }}
                >
                  Cancel
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CasesPage;
