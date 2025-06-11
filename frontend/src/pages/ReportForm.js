import React, { useState } from 'react';
import axios from 'axios';
import LocationPicker from './LocationPicker'; 

function ReportForm() {
  const [form, setForm] = useState({
    violationType: '',
    description: '',
    city: '',
    country: '',
    file: null,
    anonymous: true,
    email: '',
    phone: '',
    coordinates: null,
  });

  const [message, setMessage] = useState({ text: '', type: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, files, checked, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'file' ? files[0] : value)
    }));
  };

  const submitReport = async () => {
    if (!form.coordinates) {
      setMessage({ text: "⚠ Please select a location on the map.", type: "error" });
      return;
    }
    if (!form.violationType || !form.description) {
      setMessage({ text: "⚠ Violation type and description are required.", type: "error" });
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("reporter_type", "victim");
    formData.append("anonymous", form.anonymous);
    if (!form.anonymous) {
      formData.append("email", form.email);
      formData.append("phone", form.phone);
      formData.append("preferred_contact", "email");
    }
    formData.append("date", new Date().toISOString());
    formData.append("location_country", form.country);
    formData.append("location_city", form.city);
    formData.append("lat", form.coordinates.lat);
    formData.append("lon", form.coordinates.lng);
    formData.append("description", form.description);
    formData.append("violation_types", form.violationType);
    if (form.file) formData.append("evidence_files", form.file);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/reports/`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setMessage({ text: '✅ Report submitted successfully!', type: 'success' });
      setForm({
        violationType: '', description: '', city: '', country: '',
        file: null, anonymous: true, email: '', phone: '', coordinates: null
      });
    } catch (error) {
      const errorMsg = error.response?.data?.detail || '❌ Failed to submit report.';
      setMessage({ text: errorMsg, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '30px', maxWidth: '800px', margin: 'auto', fontFamily: 'Arial, sans-serif' }}>
      <h2>📣 Human Rights Incident Report</h2>

      <div className="form-grid">
        <label>Violation Type:</label>
        <input 
          name="violationType"
          placeholder="e.g., arbitrary_detention" 
          value={form.violationType} 
          onChange={handleChange} 
          required
        />

        <label>Description:</label>
        <textarea 
          name="description"
          placeholder="Describe the incident in detail..." 
          value={form.description} 
          onChange={handleChange} 
          required
        />

        <label>City:</label>
        <input 
          name="city"
          placeholder="City" 
          value={form.city} 
          onChange={handleChange} 
        />

        <label>Country:</label>
        <input 
          name="country"
          placeholder="Country" 
          value={form.country} 
          onChange={handleChange} 
        />

        <label>Submit Anonymously:</label>
        <input 
          type="checkbox" 
          name="anonymous"
          checked={form.anonymous} 
          onChange={handleChange} 
        />

        {!form.anonymous && (
          <>
            <label>Email:</label>
            <input 
              name="email"
              type="email"
              placeholder="Your email" 
              value={form.email} 
              onChange={handleChange} 
            />

            <label>Phone:</label>
            <input 
              name="phone"
              type="tel"
              placeholder="Your phone number" 
              value={form.phone} 
              onChange={handleChange} 
            />
          </>
        )}

        <label>Attach File (evidence):</label>
        <input 
          type="file" 
          name="file"
          onChange={handleChange} 
        />

        <label>Select Location on Map:</label>
        <LocationPicker setCoordinates={(coords) => setForm(prev => ({ ...prev, coordinates: coords }))} />
      </div>

      <br />
      <button onClick={submitReport} disabled={isSubmitting} style={{ padding: '10px 20px', fontSize: '16px' }}>
        {isSubmitting ? 'Submitting...' : '📤 Submit Report'}
      </button><br /><br />

      {message.text && (
        <div style={{ color: message.type === 'error' ? 'red' : 'green', fontWeight: 'bold' }}>
          {Array.isArray(message.text)
            ? message.text.map((err, idx) => (
                <div key={idx}>❌ {err.loc?.[err.loc.length - 1] || 'Field'}: {err.msg}</div>
              ))
            : message.text}
        </div>
      )}

      <style>{`
        .form-grid {
          display: grid;
          grid-template-columns: 150px 1fr;
          gap: 10px 20px;
          align-items: center;
        }
        textarea {
          min-height: 80px;
        }
      `}</style>
    </div>
  );
}

export default ReportForm;
