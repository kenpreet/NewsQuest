import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";

const getBackendUrl = () => {
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }
  if (typeof window === 'undefined') return 'http://localhost:5000';
  const { hostname } = window.location;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }
  return `${window.location.protocol}//${window.location.hostname}`;
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(null); // null = loading state

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoggedIn(false);
      return;
    }

    // Verify token with backend
    const backendUrl = getBackendUrl();
    fetch(`${backendUrl}/api/auth/verify`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message === "Token is valid") {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
          localStorage.removeItem("token");
        }
      })
      .catch(() => {
        setIsLoggedIn(false);
        localStorage.removeItem("token");
      });
  }, []);

  if (isLoggedIn === null) {
    return <div style={{ color: "#00b3ff", textAlign: "center", marginTop: "40vh" }}>Checking session...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isLoggedIn ? <LandingPage /> : <Navigate to="/auth" replace />
          }
        />
        <Route
          path="/auth"
          element={
            !isLoggedIn ? <AuthPage /> : <Navigate to="/" replace />
          }
        />
      </Routes>
    </Router>
  );
}
