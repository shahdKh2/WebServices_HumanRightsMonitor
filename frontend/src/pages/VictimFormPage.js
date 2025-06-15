import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const VictimFormPage = ({ mode = "add" }) => {
  const navigate = useNavigate();
  const isDisabled = mode === "edit";

  const { id } = useParams();

  const [formData, setFormData] = useState({
    type: "victim",
    anonymous: false,
    pseudonym:"",
    demographics: {
      gender: "",
      age: "",
      occupation: "",
      ethnicity: ""
    },
    contact_info: {
      email: "",
      phone: "",
      secure_messaging: ""
    },
    cases_involved: [],
    risk_assessment: {
      level: "low",
      threats: [],
      protection_needed: false
    },
    support_services: []
  });

  const [availableCases, setAvailableCases] = useState([]);

  useEffect(() => {
    if (mode === "edit" && id) {
      axios.get(`http://localhost:8000/victims/${id}`).then((res) => {
        setFormData(res.data);
      });
    }
    axios.get("http://localhost:8000/cases").then((res) => {
      setAvailableCases(res.data);
    });
  }, [id, mode]);

  const handleChange = (e, nestedKey, subKey) => {
    const { name, value, type, checked } = e.target;
    if (nestedKey && subKey) {
      setFormData({
        ...formData,
        [nestedKey]: {
          ...formData[nestedKey],
          [subKey]: type === "checkbox" ? checked : value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value
      });
    }
  };
 const handleSupportServiceChange = (index, field, value) => {
    const updatedServices = [...formData.support_services];
    updatedServices[index] = {
      ...updatedServices[index],
      [field]: value
    };
    setFormData({
      ...formData,
      support_services: updatedServices
    });
  };
  
  const addSupportService = () => {
    setFormData({
      ...formData,
      support_services: [
        ...formData.support_services,
        { type: "", provider: "", status: "" }
      ]
    });
  };

   const removeSupportService = (index) => {
    const updatedServices = formData.support_services.filter(
      (_, i) => i !== index
    );
    setFormData({
      ...formData,
      support_services: updatedServices
    });
  };
  const nullifyFields = (obj) => {
  if (!obj) return null; // if object is missing, just return null
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, null])
  );
};

const handleSubmit = (e) => {
  e.preventDefault();
  const nowISO = new Date().toISOString();

  const preparedData = {
    ...formData,
    demographics: {
      ...formData.demographics,
      age: parseInt(formData.demographics.age, 10)
    },

    pseudonym: formData.anonymous
      ? formData.pseudonym
      : nullifyFields(formData.pseudonym),
    contact_info: formData.anonymous
      ? nullifyFields(formData.contact_info)
      : formData.contact_info,
    created_at: nowISO,
    updated_at: nowISO,
  };

  const cleanedFormData = {
    type: preparedData.type,
    anonymous: preparedData.anonymous,
    pseudonym: preparedData.pseudonym,
    demographics: preparedData.demographics,
    contact_info: preparedData.contact_info,
    cases_involved: preparedData.cases_involved,
    risk_assessment: preparedData.risk_assessment,
    support_services: preparedData.support_services,
    created_at: preparedData.created_at,
    updated_at: preparedData.updated_at,
  };

  const url = mode === "edit"
    ? `http://localhost:8000/victims/${id}`
    : "http://localhost:8000/victims/";

  const request = mode === "edit" ? axios.patch : axios.post;

  request(url, cleanedFormData)
    .then((res) => {
      alert("✅ Victim/Witness saved successfully!");
      navigate("/list");
    })
    .catch((error) => {
      if (error.response) {
        alert(`❌ Error: ${error.response.status} - ${error.response.data.message || JSON.stringify(error.response.data)}`);
      } else {
        alert(`❌ Submission failed: ${error.message}`);
      }
    });
};

  const styles = {
    container: {
      maxWidth: "750px",
      margin: "2rem auto",
      padding: "2rem",
      background: "#ffffff",
      borderRadius: "12px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
      fontFamily: "Arial, sans-serif"
    },
    section: {
      marginBottom: "1.8rem",
      borderBottom: "1px solid #eee",
      paddingBottom: "1.5rem"
    },
    label: {
      display: "block",
      fontWeight: "600",
      marginBottom: "0.5rem"
    },
    input: {
      width: "100%",
      padding: "10px",
      borderRadius: "6px",
      border: "1px solid #ccc",
      marginBottom: "1rem"
    },
    select: {
      width: "100%",
      padding: "10px",
      borderRadius: "6px",
      border: "1px solid #ccc",
      marginBottom: "1rem"
    },
    checkbox: {
      marginRight: "0.5rem"
    },
    button: {
      padding: "10px 20px",
      backgroundColor: "#98768E",
      color: "#fff",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontWeight: "bold"
    },
    heading: {
      color: "#333"
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>
        {mode === "edit" ? "✏️ Edit Information" : "➕ Add Victim/Witness"}
      </h2>
      <form onSubmit={handleSubmit}>
        <div style={styles.section}>
          <label style={styles.label}>Type:</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            style={styles.select}
            disabled={isDisabled}
          >
            <option value="victim">Victim</option>
            <option value="witness">Witness</option>
          </select>
        </div>
<label style={styles.label}>
  <input
    type="checkbox"
    name="anonymous"
    checked={formData.anonymous}
    onChange={handleChange}
    style={styles.checkbox}
    disabled={isDisabled}
  />
  Anonymous? <span style={{ fontSize: "0.9em", color: "#555" }}>(Use pseudonym only – no contact info required)</span>
</label>

{formData.anonymous && (
  <div>
    <label style={styles.label}>Pseudonym (Nickname):</label>
   <input
      type="text"
      name="pseudonym"
      value={formData.pseudonym}
      onChange={handleChange}
      style={styles.input}
      disabled={isDisabled}
    />

    <p style={{ color: "#888", fontSize: "0.9em" }}>
      You may use a nickname. Contact info is not required.
    </p>
  </div>
)}

        <div style={styles.section}>
          <h4>🧍 Demographic Information</h4>
          <label style={styles.label}>Gender:</label>
<select
  value={formData.demographics.gender}
  onChange={(e) => handleChange(e, "demographics", "gender")}
  style={styles.input}
  disabled={isDisabled}
>
  <option value="">Select Gender</option>
  <option value="male">Male</option>
  <option value="female">Female</option>
  <option value="prefer_not_to_say">Prefer not to say</option>
</select>

          <label style={styles.label}>Age:</label>
          <input
            type="number"
            value={formData.demographics.age}
            onChange={(e) => handleChange(e, "demographics", "age")}
            style={styles.input}
            disabled={isDisabled}
          />
          <label style={styles.label}>Occupation:</label>
          <input
            type="text"
            value={formData.demographics.occupation}
            onChange={(e) => handleChange(e, "demographics", "occupation")}
            style={styles.input}
            disabled={isDisabled}
          />
          <label style={styles.label}>Ethnicity:</label>
          <input
            type="text"
            value={formData.demographics.ethnicity}
            onChange={(e) => handleChange(e, "demographics", "ethnicity")}
            style={styles.input}
            disabled={isDisabled}
          />
        </div>

        {!formData.anonymous && (
          <div style={styles.section}>
            <h4>📞 Contact Information</h4>
            <label style={styles.label}>Email:</label>
            <input
              type="email"
              value={formData.contact_info.email}
              onChange={(e) => handleChange(e, "contact_info", "email")}
              style={styles.input}
              disabled={isDisabled}
            />
            <label style={styles.label}>Phone Number:</label>
            <input
              type="text"
              value={formData.contact_info.phone}
              onChange={(e) => handleChange(e, "contact_info", "phone")}
              style={styles.input}
              disabled={isDisabled}
            />
            <label style={styles.label}>Secure Messaging:</label>
            <input
              type="text"
              value={formData.contact_info.secure_messaging}
              onChange={(e) => handleChange(e, "contact_info", "secure_messaging")}
              style={styles.input}
              disabled={isDisabled}
            />
          </div>
        )}

        <div style={styles.section}>
          <h4>📁 Link to Case(s)</h4>
          <label style={styles.label}>Select Related Case(s):</label>
          <select
            multiple
            value={formData.cases_involved}
            onChange={(e) =>
              setFormData({
                ...formData,
                cases_involved: Array.from(e.target.selectedOptions, (o) => o.value)
              })
            }
            style={{ ...styles.select, minHeight: "100px" }} 
            disabled={isDisabled}
          >
            {availableCases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.section}>
          <h4>⚠️ Risk Assessment</h4>
          <label style={styles.label}>Level:</label>
          <select
            value={formData.risk_assessment.level}
            onChange={(e) => handleChange(e, "risk_assessment", "level")}
            style={styles.select}
            disabled={false}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

         <label style={styles.label}>Threats:</label>
{formData.risk_assessment.threats.map((threat, index) => (
  <div key={index} style={{ display: "flex", marginBottom: "0.5rem" }}>
    <input
      type="text"
      value={threat}
      onChange={(e) => {
        const newThreats = [...formData.risk_assessment.threats];
        newThreats[index] = e.target.value;
        setFormData({
          ...formData,
          risk_assessment: {
            ...formData.risk_assessment,
            threats: newThreats
          }
        });
      }}
      style={{ ...styles.input, flexGrow: 1 }}
      disabled={false}
      placeholder="Enter threat description"
    />
    <button
      type="button"
      onClick={() => {
        const newThreats = formData.risk_assessment.threats.filter((_, i) => i !== index);
        setFormData({
          ...formData,
          risk_assessment: {
            ...formData.risk_assessment,
            threats: newThreats
          }
        });
      }}
      style={{ marginLeft: "0.5rem", backgroundColor: "#dc3545", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}
      disabled={false}
    >
      Remove
    </button>
  </div>
))}
<button
  type="button"
  onClick={() => {
    setFormData({
      ...formData,
      risk_assessment: {
        ...formData.risk_assessment,
        threats: [...formData.risk_assessment.threats, ""]
      }
    });
  }}
  style={styles.button}
  disabled={false}
>
  + Add Threat
</button>


          <label style={styles.label}>
            <input
              type="checkbox"
              checked={formData.risk_assessment.protection_needed}
              onChange={(e) => handleChange(e, "risk_assessment", "protection_needed")}
              style={styles.checkbox}
            disabled={false}
            />
            Protection Needed?
          </label>
        </div>
        <div style={styles.section}>
          <h4>🛠️ Support Services</h4>
          {formData.support_services.map((service, index) => (
            <div key={index} style={styles.supportServiceContainer}>
              <label style={styles.label}>Type of Service:</label>
              <input
                type="text"
                value={service.type}
                onChange={(e) =>
                  handleSupportServiceChange(index, "type", e.target.value)
                }
                style={styles.input}
                disabled={isDisabled}
                required
              />

              <label style={styles.label}>Provider:</label>
              <input
                type="text"
                value={service.provider}
                onChange={(e) =>
                  handleSupportServiceChange(index, "provider", e.target.value)
                }
                style={styles.input}
                disabled={isDisabled}
                required
              />

              <label style={styles.label}>Status:</label>
              <select
                value={service.status}
                onChange={(e) =>
                  handleSupportServiceChange(index, "status", e.target.value)
                }
                style={styles.select}
                disabled={isDisabled}
                required
              >
                <option value="">Select status</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <button
                type="button"
                style={{ ...styles.button, backgroundColor: "#dc3545" }}
                disabled={isDisabled}
                onClick={() => removeSupportService(index)}
              >
                Remove Service
              </button>
            </div>
          ))}

          <button
            type="button"
            style={styles.button}
            disabled={isDisabled}
            onClick={addSupportService}
          >
            + Add Support Service
          </button>
        </div>
        <button type="submit" style={styles.button}>
          💾 {mode === "edit" ? "Save Changes" : "Add"}
        </button>
      </form>
    </div>
  );
};

export default VictimFormPage;
