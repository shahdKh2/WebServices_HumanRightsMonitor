import React, { useState, useEffect } from "react";

export default function HomePage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

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
            {user ? (
              <>
                Welcome back, <strong>{user.role && `${user.role} `}{user.full_name || user.email}</strong> 👋<br />
                We're truly grateful to have you with us on this important journey. Together, we’re making a meaningful difference in the lives of victims and witnesses. Thank you for being part of our community and standing strong with those who need support the most.
              </>
            ) : (
              <>
                Welcome to the Victim Support Portal 👋<br />
                This platform is dedicated to empowering victims and witnesses with integrity, care, and respect. Please log in to access personalized tools, resources, and information tailored to your role. Together, we can create a safer, more supportive environment for everyone affected. Your journey to making a positive impact starts here.
              </>
            )}
          </div>

      </div>
      <div style={rightStyle}>
        <img src="/landingPage.png" alt="Landing" style={imageStyle} />
      </div>
    </div>
  );
}
