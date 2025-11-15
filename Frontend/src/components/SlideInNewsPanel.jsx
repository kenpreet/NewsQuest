import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Newspaper, Clock, ExternalLink, TrendingUp, Eye } from "lucide-react";
import "./SlideInNewsPanel.css";
import { fetchNews, detectFakeNews, analyzeBiasAndCredibility, generateCombinedArticle } from "../utils/News_API&AI_HelperFunctions";

export default function SlideInNewsPanel({ state, showNews, onClose }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [combinedArticle, setCombinedArticle] = useState("");
  const [showCombinedModal, setShowCombinedModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatingMerged, setGeneratingMerged] = useState(false);



  useEffect(() => {
    if (!state || !showNews) return;

    async function load() {
      setLoading(true);

      try {
        // 5 articles
        const news = await fetchNews(state + " India", 5);
        setArticles(news);
      } catch (e) {
        console.error("News fetch error:", e);
        setArticles([]);
      }

      setLoading(false);
    }

    load();
  }, [state, showNews]);


  if (!showNews) return null;


  async function generateMerged() {
    if (!state) return;

    setGeneratingMerged(true);

    try {
      const news = await fetchNews(state + " India", 5);

      const enriched = [];
      for (const article of news) {
        const text = article.content || article.description || "";
        const source = article?.source?.name || "Unknown";

        const fakeRes = await detectFakeNews(text);
        const biasRes = await analyzeBiasAndCredibility(text, source);

        enriched.push({
          ...article,
          fake: fakeRes,
          bias: biasRes,
        });
      }

      const merged = await generateCombinedArticle(enriched);

      setCombinedArticle(merged);
      setShowCombinedModal(true);
    } catch (err) {
      console.error("Combined article generation failed:", err);
      setCombinedArticle("Unable to generate combined article.");
      setShowCombinedModal(true);
    } finally {
      setGeneratingMerged(false);
    }
  }



  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="news-panel"
    >
      <div className="panel-glow"></div>

      <div classname="panel-container">
        {/* Header */}
        <div className="panel-header">
          <div className="header-left">
            <motion.div
              className="header-icon"
              animate={{
                boxShadow: [
                  "0 0 20px rgba(6,182,212,0.3)",
                  "0 0 40px rgba(6,182,212,0.6)",
                  "0 0 20px rgba(6,182,212,0.3)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Newspaper className="icon-white" />
            </motion.div>

            <div>
              <h2 className="header-title">Latest News</h2>
              <p className="header-sub">{state}</p>
            </div>
          </div>

          <motion.button
            className="close-btn"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
          >
            <X className="icon-red" />
          </motion.button>
        </div>

        {/* Stats */}
        <div className="stats-row">
          <div className="live-badge">
            <div className="live-dot"></div> LIVE FEED
          </div>
          <div className="article-count">{articles.length} articles</div>
        </div>

        <button
          onClick={generateMerged}
          className="generate-btn"
          disabled={generating || loading}
          style={{
            margin: "10px 0",
            padding: "10px 14px",
            borderRadius: "8px",
            background: "#00b3ff",
            border: "none",
            color: "white",
            cursor: "pointer",
            width: "100%",
            opacity: generating ? 0.6 : 1
          }}
        >
          {generating ? "Generating combined article..." : "Generate Combined Article"}
        </button>


        {/* Scroll Area */}
        <div className="panel-content">
          {loading ? (
            <div className="loading-cards">
              {[1, 2, 3].map((i) => (
                <div key={i} className="loading-card"></div>
              ))}
            </div>
          ) : (
            articles.map((a, index) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="article-card"
              >
                <div className="article-top">
                  <span className="category-chip">{a.category}</span>

                  <div className="article-meta">
                    {a.trending && (
                      <span className="trending">
                        <TrendingUp className="meta-icon" /> Trending
                      </span>
                    )}
                    <span><Eye className="meta-icon" /> {a.views}</span>
                    <span><Clock className="meta-icon" /> {a.timestamp}</span>
                  </div>
                </div>

                <h3 className="article-title">{a.title}</h3>
                <p className="article-summary">{a.summary}</p>

                <div className="read-more">
                  Read full article <ExternalLink className="meta-icon" />
                </div>
                <button
                  onClick={generateMerged}
                  className="generate-btn"
                  disabled={generatingMerged || loading}
                  style={{
                    margin: "10px 0",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    background: "#00b3ff",
                    border: "none",
                    color: "white",
                    cursor: "pointer",
                    width: "100%",
                    opacity: generatingMerged ? 0.6 : 1
                  }}
                >
                  {generatingMerged ? "Generating combined article..." : "Generate Combined Article"}
                </button>
                <div className="bottom-accent"></div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {showCombinedModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#0b111a",
              padding: "20px",
              borderRadius: "12px",
              width: "70%",
              maxHeight: "80vh",
              overflowY: "auto",
              color: "white",
            }}
          >
            <h2>Combined AI Article</h2>
            <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
              {combinedArticle}
            </p>

            <button
              style={{
                marginTop: "20px",
                background: "#00b3ff",
                padding: "10px 16px",
                borderRadius: "8px",
                border: "none",
                color: "white",
                cursor: "pointer",
              }}
              onClick={() => setShowCombinedModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

    </motion.div>
  );
}
