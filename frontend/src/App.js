// App.js
import React from "react";
import Header from "./pages/Header";
import Footer from "./pages/Footer";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CasesPage from "./pages/CasesPage";
import LandingPage from "./pages/LandingPage";
import VictimList from "./pages/VictimsList";
import VictimViewPage from "./pages/VictimViewPage";
import VictimFormPage from "./pages/VictimFormPage";
import ReportForm from "./pages/ReportForm";
import HomePage from "./pages/HomePage";

function App() {
  const appStyle = {
    minHeight: "100vh",
    backgroundColor: "#F6D4CF",
    paddingBottom: "3rem",
  };

  return (
    <Router>
      <div className="App" style={appStyle}>
        <Header />

        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/list" element={<VictimList />} />
          <Route path="/view/:id" element={<VictimViewPage />} />
          <Route path="/edit/:id" element={<VictimFormPage mode="edit" />} />
          <Route path="/add" element={<VictimFormPage mode="add" />} />
          <Route path="/CasesPage" element={<CasesPage />} />
          <Route path="/ReportForm" element={<ReportForm />} />
          <Route path="/HomePage" element={<HomePage />} />

        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
