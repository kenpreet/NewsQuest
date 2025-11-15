import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  X,
  Shield,
  TrendingUp,
  AlertCircle,
  BarChart3,
  CheckCircle
} from "lucide-react";
import "./SlideInSourcesPanel.css";
import { analyzeBiasAndCredibility, fetchNews } from "../utils/News_API&AI_HelperFunctions";


export default function SlideInSourcesPanel({ state, showNews, onClose }) {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);

  const getBiasColor = (bias) => {
    switch (bias) {
      case "left":
        return { bar: "#3b82f6", glow: "rgba(59,130,246,0.45)" };
      case "right":
        return { bar: "#ef4444", glow: "rgba(239,68,68,0.45)" };
      case "center":
      default:
        return { bar: "#8b5cf6", glow: "rgba(139,92,246,0.5)" };
    }
  };

  const getBiasLabel = (bias) => {
    if (bias === "left") return "Left-Leaning";
    if (bias === "right") return "Right-Leaning";
    return "Balanced";
  };

  useEffect(() => {
  if (!state || !showNews) return;

  async function loadSources() {
    setLoading(true);

    try {
      const news = await fetchNews(state + " India", 5);

      const analyzed = [];

      for (let i = 0; i < news.length; i++) {
        const article = news[i];

        const text = article.content || article.description || "";
        const sourceName = article?.source?.name || "Unknown";

        const ai = await analyzeBiasAndCredibility(text, sourceName);

        analyzed.push({
          id: i + 1,
          name: sourceName,
          bias: ai.bias_description.includes("left")
            ? "left"
            : ai.bias_description.includes("right")
            ? "right"
            : "center",
          biasScore: ai.bias_score ?? 50,
          reliability: ai.credibility_score ?? 50,
          coverage: ai.bias_description,
          verified: true,
        });
      }

      setSources(analyzed);
    } catch (e) {
      console.error("SOURCE PANEL AI ERROR:", e);
      setSources([]);
    }

    setLoading(false);
  }

  loadSources();
}, [state, showNews]);


  if (!showNews) return null;

  return (
    <motion.div
      className="sources-panel"
      initial={{ x: "-100%" }}
      animate={{ x: 0 }}
      exit={{ x: "-100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
    >
      <div className="sources-glow"></div>

      <div className="sources-container">
        {/* Header */}
        <div className="sources-header">
          <div className="sources-header-left">
            <motion.div
              className="sources-header-icon"
              animate={{
                boxShadow: [
                  "0 0 20px rgba(139,92,246,0.3)",
                  "0 0 40px rgba(139,92,246,0.6)",
                  "0 0 20px rgba(139,92,246,0.3)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Shield className="icon-white" />
            </motion.div>

            <div>
              <h2 className="sources-title">Sources</h2>
              <p className="sources-sub">Bias Analysis · {state}</p>
            </div>
          </div>

          <motion.button
            className="sources-close-btn"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
          >
            <X className="icon-red" />
          </motion.button>
        </div>

        {/* Stats */}
        <div className="sources-stats">
          <div className="analysis-badge">
            <BarChart3 className="meta-icon" /> ANALYSIS MODE
          </div>
          <div className="sources-count">{sources.length} sources verified</div>
        </div>

        {/* Content */}
        <div className="sources-content">
          {loading ? (
            <>
              <div className="loading-card"></div>
              <div className="loading-card"></div>
              <div className="loading-card"></div>
            </>
          ) : (
            <>
              {sources.map((src, i) => {
                const bias = getBiasColor(src.bias);

                return (
                  <motion.div
                    key={src.id}
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="source-card"
                  >
                    <div className="source-top">
                      <h3 className="source-name">{src.name}</h3>

                      {src.verified && (
                        <div className="verified-chip">
                          <CheckCircle className="meta-icon" />
                          Verified
                        </div>
                      )}
                    </div>

                    <div
                      className="bias-label"
                      style={{ backgroundColor: bias.bar, boxShadow: `0 0 20px ${bias.glow}` }}
                    >
                      {getBiasLabel(src.bias)}
                    </div>

                    {/* Bias bar */}
                    <div className="bar-block">
                      <div className="bar-label">
                        Political Bias <span>{src.biasScore}/10</span>
                      </div>
                      <div className="bar-bg">
                        <motion.div
                          className="bar-fill"
                          style={{ backgroundColor: bias.bar, boxShadow: `0 0 12px ${bias.glow}` }}
                          initial={{ width: 0 }}
                          animate={{ width: `${src.biasScore * 10}%` }}
                          transition={{ duration: 0.8 }}
                        />
                      </div>
                    </div>

                    {/* Reliability */}
                    <div className="bar-block">
                      <div className="bar-label">
                        Reliability <span>{src.reliability}%</span>
                      </div>
                      <div className="bar-bg">
                        <motion.div
                          className="bar-fill-green"
                          initial={{ width: 0 }}
                          animate={{ width: `${src.reliability}%` }}
                          transition={{ duration: 0.8 }}
                        />
                      </div>
                    </div>

                    <div className="coverage-box">
                      <AlertCircle className="meta-icon" />
                      {src.coverage}
                    </div>
                  </motion.div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
