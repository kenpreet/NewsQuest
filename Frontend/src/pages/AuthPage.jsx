import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ParticleBackground from "../components/ParticleBackground";
import DataStream from "../components/DataStream";
import HolographicPanel from "../components/HolographicPanel";
import { Radio, ArrowLeft } from "lucide-react";
import "./AuthPage.css";
import AuthForm from "../components/AuthForm";

export default function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="auth-container app-root">
      {/* Futuristic canvas background effects */}
      <div className="mesh-bg" />
      <ParticleBackground />
      <DataStream />
      <div className="scanlines-overlay" />

      {/* Dynamic spotlight tracking the user's cursor */}
      <motion.div
        className="cursor-spotlight"
        style={{ left: mousePosition.x - 192, top: mousePosition.y - 192 }}
        animate={{ x: 0, y: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 100 }}
      />

      {/* Floating Back to Home Button */}
      <button
        onClick={() => navigate("/")}
        className="back-home-btn"
      >
        <ArrowLeft className="icon-16" />
        Back to Home
      </button>

      <div className="auth-wrapper" style={{ zIndex: 10, width: "420px" }}>
        <HolographicPanel glowColor="cyan">
          <div className="auth-inner-card" style={{ padding: "10px 15px" }}>
            <div className="auth-header">
              {/* Premium Brand Header */}
              <div className="brand" style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "25px" }}>
                <motion.div
                  className="brand-icon"
                  style={{ marginRight: "12px", display: "flex", justifyContent: "center", alignItems: "center", width: "40px", height: "40px", borderRadius: "10px", background: "rgba(6, 182, 212, 0.15)", border: "1px solid rgba(6, 182, 212, 0.4)" }}
                  animate={{
                    boxShadow: [
                      "0 0 20px rgba(6,182,212,0.3)",
                      "0 0 40px rgba(6,182,212,0.6)",
                      "0 0 20px rgba(6,182,212,0.3)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Radio className="icon-24 cyan" style={{ color: "#00eaff" }} />
                </motion.div>
                <div style={{ textAlign: "left" }}>
                  <h1 className="brand-title" style={{ fontSize: "1.8rem", margin: 0, letterSpacing: "1.5px", fontWeight: "800", textTransform: "uppercase" }}>
                    <span className="brand-faint" style={{ color: "rgba(255, 255, 255, 0.5)", fontWeight: "300" }}>NEWS</span>
                    <span className="brand-grad" style={{ background: "linear-gradient(90deg, #00eaff, #00b3ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>QUEST</span>
                  </h1>
                  <p className="brand-sub" style={{ margin: 0, fontSize: "9px", letterSpacing: "2px", opacity: 0.6 }}>REAL-TIME INTELLIGENCE</p>
                </div>
              </div>

              {/* Login / Register Toggle */}
              <div className="auth-toggle">
                <button
                  className={isLogin ? "active" : ""}
                  onClick={() => setIsLogin(true)}
                >
                  Login
                </button>
                <button
                  className={!isLogin ? "active" : ""}
                  onClick={() => setIsLogin(false)}
                >
                  Register
                </button>
              </div>
            </div>

            <AuthForm isLogin={isLogin} />
          </div>
        </HolographicPanel>
      </div>
    </div>
  );
}
