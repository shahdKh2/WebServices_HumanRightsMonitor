import React, { useState, useRef, useEffect } from "react";
import { Bar, Pie, Line } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const inputStyle = {
  padding: "0.5rem 1rem",
  borderRadius: "8px",
  border: "1px solid #ccc",
  minWidth: "180px",
  fontSize: "0.95rem",
};

const inputStyle2 = {
  ...inputStyle,
  marginRight: "1rem",
  backgroundColor: "#281E30",
  color: "white",
};

const AnalyticsDashboard = () => {
  const [filterViolationType, setFilterViolationType] = useState("");

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    region: "",
    type: "",
  });

  const [mockViolations, setMockViolations] = useState({
    labels: [],
    datasets: [
      {
        label: "Number of Violations",
        data: [],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
      },
    ],
  });
  const [mockRegions, setMockRegions] = useState({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: ["#4BC0C0", "#FF6384", "#9966FF"],
      },
    ],
  });

  const [mockTimeline, setMockTimeline] = useState({
    labels: [],
    datasets: [
      {
        label: "Cases Over Time",
        data: [],
        fill: false,
        borderColor: "#742774",
      },
    ],
  });

  const dashboardRef = useRef();

  useEffect(() => {
    fetch("http://localhost:8000/analytics/violations")
      .then((res) => res.json())
      .then((data) => {
        const labels = Object.keys(data);
        const counts = Object.values(data);
        setMockViolations({
          labels,
          datasets: [
            {
              label: "Number of Violations",
              data: counts,
              backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
            },
          ],
        });
      });
  }, []);
  useEffect(() => {
    fetch("http://localhost:8000/analytics/geodata")
      .then((res) => res.json())
      .then((data) => {
        setMockRegions({
          labels: Object.keys(data),
          datasets: [
            {
              data: Object.values(data),
              backgroundColor: ["#4BC0C0", "#FF6384", "#9966FF"],
            },
          ],
        });
      });
  }, []);
  useEffect(() => {
    fetch("http://localhost:8000/analytics/timeline")
      .then((res) => res.json())
      .then((data) => {
        setMockTimeline({
          labels: Object.keys(data),
          datasets: [
            {
              label: "Cases Over Time",
              data: Object.values(data),
              fill: false,
              borderColor: "#742774",
            },
          ],
        });
      });
  }, []);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };
  const applyFilters = () => {
    const query = new URLSearchParams(filters).toString();

    // Fetch filtered data
    fetch(`http://localhost:8000/analytics/violations?${query}`)
      .then((res) => res.json())
      .then((data) => {
        setMockViolations({
          labels: Object.keys(data),
          datasets: [
            {
              label: "Number of Violations",
              data: Object.values(data),
              backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
            },
          ],
        });
      });

    // Repeat similar fetch for timeline
    fetch(`http://localhost:8000/analytics/timeline?${query}`)
      .then((res) => res.json())
      .then((data) => {
        setMockTimeline({
          labels: Object.keys(data),
          datasets: [
            {
              label: "Cases Over Time",
              data: Object.values(data),
              fill: false,
              borderColor: "#742774",
            },
          ],
        });
      });

    // And for region
    fetch(`http://localhost:8000/analytics/geodata?${query}`)
      .then((res) => res.json())
      .then((data) => {
        setMockRegions({
          labels: Object.keys(data),
          datasets: [
            {
              data: Object.values(data),
              backgroundColor: ["#4BC0C0", "#FF6384", "#9966FF"],
            },
          ],
        });
      });
  };

  const downloadPDF = () => {
    html2canvas(dashboardRef.current).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("analytics_report.pdf");
    });
  };

  const downloadExcel = () => {
    const data = [
      ["Violation Type", ...mockViolations.labels],
      ["Counts", ...mockViolations.datasets[0].data],
      [],
      ["Region", ...mockRegions.labels],
      ["Counts", ...mockRegions.datasets[0].data],
      [],
      ["Month", ...mockTimeline.labels],
      ["Cases", ...mockTimeline.datasets[0].data],
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Analytics");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    saveAs(new Blob([excelBuffer]), "analytics_report.xlsx");
  };

  return (
    <div style={{ padding: "2rem" }} ref={dashboardRef}>
      <h2>📊 Data Analysis & Visualization</h2>

      {/* Filters */}
      <div
        style={{
          marginBottom: "2rem",
          display: "flex",
          justifyContent: "center",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <input
          type="date"
          name="startDate"
          onChange={handleChange}
          style={inputStyle}
        />
        <input
          type="date"
          name="endDate"
          onChange={handleChange}
          style={inputStyle}
        />
        <input
          type="text"
          name="region"
          placeholder="Region"
          onChange={handleChange}
          style={inputStyle}
        />
        <select
  name="type"
  value={filters.type}
  onChange={handleChange}
  style={inputStyle}
>

          <option value="">Violation Type</option>
          <option value="forced_displacement">Forced Displacement</option>
          <option value="arbitrary_detention">Arbitrary Detention</option>
          <option value="torture">Torture</option>
          <option value="freedom_of_expression">Freedom of Expression</option>
        </select>
        <button onClick={applyFilters} style={inputStyle2}>
          Apply Filters
        </button>
      </div>

      {/* Export Buttons */}
      <div style={{ marginBottom: "2rem", textAlign: "center" }}>
        <button onClick={downloadPDF} style={inputStyle2}>
          Download PDF
        </button>
        <button onClick={downloadExcel} style={inputStyle2}>
          Download Excel
        </button>
      </div>

      {/* Charts */}
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <h3>Violation Types</h3>
          <Bar data={mockViolations} />
        </div>

        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <h3>By Region</h3>
          <Pie data={mockRegions} />
        </div>

        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <h3>Timeline</h3>
          <Line data={mockTimeline} />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
