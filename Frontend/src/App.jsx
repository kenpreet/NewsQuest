import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";

export default function App() {
  // Check if user is logged in
  const isLoggedIn = localStorage.getItem("token");

  return (
    <Router>
      <Routes>
        {/* Landing Page (protected route) */}
        <Route
          path="/"
          element={
            isLoggedIn ? <LandingPage /> : <Navigate to="/auth" replace />
          }
        />

        {/* Auth Page */}
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
