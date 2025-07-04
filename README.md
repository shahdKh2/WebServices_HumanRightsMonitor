# 🛡️ Human Rights Monitor MIS

A **Human Rights Monitoring Information System (MIS)** built for COMP4382 – Computer Science Department (2024/2025, Second Semester). This secure, full-stack web application enables human rights organizations to document, track, and analyze violations efficiently.

## 📌 Overview

This MIS provides tools for:
- Recording human rights abuses (e.g., arbitrary detention, forced displacement)
- Managing secure victim and witness data
- Receiving reports from multiple sources (web, mobile, NGOs)
- Generating visual data analytics
- Supporting legal actions with structured documentation

> ✅ Developed using **FastAPI** + **MongoDB** on the backend, and **React** on the frontend.

---

## 👥 Contributors

| Name           | Role                         | Module                                 |
|--------------- |------------------------------|----------------------------------------|
| Shahd Khalaf   | Student 1                    | Case Management System & Data Analysis |
| Majd Hamarsheh | Student 2                    | Incident Reporting Module              |
| Sama Wahidee   | Student 3                    | Victim/Witness Database Module         |

---

## 🔧 Tech Stack

- **Backend:** Python, FastAPI, MongoDB (NoSQL)
- **Frontend:** React.js
- **Visualization:** Chart.js, Plotly
- **Tools:** Postman (API Testing), Git & GitHub (Version Control), OpenStreetMap (Geo-Tagging)

---

## 🧩 Modules Breakdown

### 1️⃣ Case Management System – *Shahd Khalaf*

> Track human rights cases from creation to resolution

- ✅ CRUD operations for cases
- ✅ Status tracking (new, under_investigation, resolved)
- ✅ File/document attachments
- ✅ Search & filter (by date, location, type)

**Endpoints:**
- `POST /cases/`
- `GET /cases/{id}`
- `GET /cases/` (with filters)
- `PATCH /cases/{id}`
- `DELETE /cases/{id}`

---

### 2️⃣ Incident Reporting Module – *Majd Hamarsheh*

> Securely report human rights violations

- ✅ Anonymous report submission
- ✅ Media attachments (photo, video, docs)
- ✅ Geolocation tagging via OpenStreetMap
- ✅ Analytics: violations by type

**Endpoints:**
- `POST /reports/`
- `GET /reports/` (filterable)
- `PATCH /reports/{id}`
- `GET /reports/analytics`

---

### 3️⃣ Victim/Witness Database – *Sama Wahidee*

> Store and protect victim and witness data

- ✅ Role-based access control
- ✅ Pseudonyms & anonymity options
- ✅ Risk assessment tracking (low/medium/high)

**Endpoints:**
- `POST /victims/`
- `GET /victims/{id}`
- `PATCH /victims/{id}`
- `GET /victims/case/{case_id}`

---

### 4️⃣ Data Visualization & Reports – *Shahd Khalaf*

> Gain insights through interactive dashboards

- ✅ Violation trends over time
- ✅ Geographic mapping
- ✅ Exportable PDF/Excel reports
- ✅ Charts: bar, pie, timeline, heatmap

**Endpoints:**
- `GET /analytics/violations`
- `GET /analytics/geodata`
- `GET /analytics/timeline`

---

## 🧪 Sample MongoDB Collections

- `cases` – human rights case records
- `incident_reports` – incident submissions
- `victims` – victim/witness data (encrypted where needed)
- `case_status_history`, `report_evidence`, `victim_risk_assessments`

---

## 🚀 How to Run

### 🖥️ Frontend (React)
```bash
cd frontend
npm install
npm start
```

### 🛠️ Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```




