import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // NEW
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
    setUser(JSON.parse(savedUser));
    }
    setLoading(false); // Done checking
  }, []);

  const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const response = await axios.post("http://localhost:8000/auth/login", {
      email,
      password,
    });

    console.log("Login response:", response.data);
    setUser(response.data);
    localStorage.setItem("user", JSON.stringify(response.data));
    setErrorMsg("");

    // Redirect to homepage
    navigate("/HomePage");
  } catch (error) {
    setErrorMsg("Invalid email or password");
  }
};

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

  const formStyle = {
    marginTop: "2rem",
    backgroundColor: "#F6D4CF",
    padding: "1rem",
    borderRadius: "8px",
    maxWidth: "300px",
  };

  const inputStyle = {
    width: "100%",
    padding: "0.5rem",
    backgroundColor: "#D3B8C5",
    marginBottom: "1rem",
    border: "1px solid #ccc",
    borderRadius: "4px",
  };

  const buttonStyle = {
    width: "100%",
    padding: "0.5rem",
    backgroundColor: "#281E30",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
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

  if (loading) {
    return <div style={{ padding: "2rem", fontSize: "1.5rem" }}>Loading...</div>;
  }

  return (
    <div style={containerStyle}>
      <div style={leftStyle}>
        Victim Support Portal
        <div style={sentenceStyle}>
 Welcome to the Victim Support Portal 👋<br />
                This platform is dedicated to empowering victims and witnesses with integrity, care, and respect. Please log in to access personalized tools, resources, and information tailored to your role. Together, we can create a safer, more supportive environment for everyone affected. Your journey to making a positive impact starts here.
                      </div>
          <form onSubmit={handleLogin} style={formStyle}>
            {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
            <input
              type="email"
              placeholder="Email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
            />
            <button type="submit" style={buttonStyle}>Login</button>
          </form>
      </div>
      <div style={rightStyle}>
        <img src="/landingPage.png" alt="Landing" style={imageStyle} />
      </div>
    </div>
  );
}
