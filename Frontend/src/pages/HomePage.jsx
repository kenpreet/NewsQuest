import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ParticleBackground from "../components/ParticleBackground";
import DataStream from "../components/DataStream";
import HolographicPanel from "../components/HolographicPanel";
import { Radio, ShieldAlert, Map, Sparkles, LogIn, ArrowRight } from "lucide-react";
import "./HomePage.css";

export default function HomePage({ isLoggedIn }) {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleCTA = () => {
    if (isLoggedIn) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  };

  const features = [
    {
      icon: Map,
      title: "Interactive Spatial Cartography",
      description: "Explore the state-by-state news space of India. Drive a news van, pilot a chopper, or launch a reconnaissance drone using real-time geofenced coordinate projections.",
      color: "cyan"
    },
    {
      icon: Sparkles,
      title: "AI-Powered Synthesis",
      description: "Aggregates multi-source reporting into unified, factual briefs using the Google Gemini model. Read cohesive articles that capture all sides of a story.",
      color: "purple"
    },
    {
      icon: ShieldAlert,
      title: "Linguistic Bias Spectrum",
      description: "Evaluate the political spectrum (Left, Balanced, Right) and publisher credibility rating instantly using deep semantic keyword and domain validation engines.",
      color: "pink"
    }
  ];

  return (
    <div className="home-root app-root">
      {/* Fixed background system */}
      <div className="mesh-bg" style={{ position: "fixed", inset: 0, zIndex: 0 }} />
      <div style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none" }}>
        <ParticleBackground />
      </div>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 2 }}>
        <DataStream />
      </div>
      <div className="scanlines-overlay" style={{ position: "fixed", inset: 0, zIndex: 3, pointerEvents: "none" }} />

      {/* Cursor spotlight */}
      <motion.div
        className="cursor-spotlight"
        style={{ left: mousePosition.x - 192, top: mousePosition.y - 192, position: "fixed", zIndex: 2 }}
        animate={{ x: 0, y: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 100 }}
      />

      {/* Scrollable Content Wrapper */}
      <div className="home-scroll-container">
        {/* Navigation Header */}
        <header className="home-nav">
          <div className="brand">
            <div className="brand-icon">
              <Radio className="icon-24 white" />
            </div>
            <div>
              <h1 className="brand-title">
                <span className="brand-faint">NEWS</span>
                <span className="brand-grad">QUEST</span>
              </h1>
              <p className="brand-sub">REAL-TIME INTELLIGENCE</p>
            </div>
          </div>

          <button className="nav-auth-btn" onClick={handleCTA}>
            {isLoggedIn ? "Go to Dashboard" : "Login Console"}
            <LogIn className="icon-16 btn-icon" />
          </button>
        </header>

        {/* Main Hero and Features Section */}
        <main className="home-hero-section">
          {/* Core Headline block */}
          <div className="hero-content">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="hero-badge"
            >
              <span className="live-dot" /> NEXT-GEN AGGREGATOR IS LIVE
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="hero-title"
            >
              Gamified News Exploration <br />
              Meet <span className="highlight-cyan">AI Intelligence</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hero-desc"
            >
              Step into a real-time command console to map, synthesize, and audit news across India. Detect media bias, filter by geography, and read unbiased summaries with a single click.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="hero-actions"
            >
              <button className="cta-primary-btn" onClick={handleCTA}>
                {isLoggedIn ? "LAUNCH COMMAND PLATFORM" : "ENTER PLATFORM CONSOLE"}
                <ArrowRight className="icon-18 btn-icon-right" />
              </button>
            </motion.div>
          </div>

          {/* Feature Cards Grid */}
          <div className="home-features-grid">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: i * 0.1 + 0.3 }}
                  className="feature-card-wrapper"
                >
                  <HolographicPanel glowColor={f.color}>
                    <div className="feature-card-content">
                      <div className={`feature-icon-box ${f.color}`}>
                        <Icon className="icon-24" />
                      </div>
                      <h3>{f.title}</h3>
                      <p>{f.description}</p>
                    </div>
                  </HolographicPanel>
                </motion.div>
              );
            })}
          </div>
        </main>

        {/* Cyberpunk Footer details */}
        <footer className="home-footer">
          <div>NEWSQUEST v2.0.1 // COGNITIVE AGGREGATION SYSTEM</div>
          <div>ALL CHANNELS ACTIVE // SECURE JWT LAYER READY</div>
        </footer>
      </div>
    </div>
  );
}
