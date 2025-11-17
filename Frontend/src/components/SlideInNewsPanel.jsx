import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Newspaper, Clock, ExternalLink } from "lucide-react";
import "./SlideInNewsPanel.css";
import { fetchNews, generateArticleFromPipeline } from "../utils/News_API&AI_HelperFunctions";

export default function SlideInNewsPanel({ state, showNews, onClose }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [combinedArticle, setCombinedArticle] = useState("");
  const [showCombinedModal, setShowCombinedModal] = useState(false);
  const [generatingSingleId, setGeneratingSingleId] = useState(null);
  const [modalMetrics, setModalMetrics] = useState({ biasScore: 50, credibilityScore: 75, biasCategory: "center" });

  useEffect(() => {
    if (!state || !showNews) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const news = await fetchNews(state + " India", 5);
        // Add lightweight frontend analysis for each article
        const normalized = news.map((n, i) => {
          const base = { ...n, _localId: n.url || `${state}-${i}` };
          base._analysis = analyzeArticleFrontend(base);
          return base;
        });
        if (!cancelled) setArticles(normalized);
      } catch (e) {
        console.error("News fetch error:", e);
        if (!cancelled) setArticles([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [state, showNews]);

  // Simple button click: call pipeline and display result
  async function generateArticle(article) {
    if (!article) return;
    const id = article._localId || article.url || article.title;
    setGeneratingSingleId(id);

    try {
      const query = article.title || state || "news";
      const result = await generateArticleFromPipeline(query, article);
      // result: { content, metrics }
      const article_text = result?.content || 'No article';
      const metrics = result?.metrics || { biasScore: 50, credibilityScore: 75, biasCategory: 'center' };
      setModalMetrics({ biasScore: metrics.biasScore, credibilityScore: metrics.credibilityScore, biasCategory: metrics.biasCategory });
      setCombinedArticle(article_text);
      setShowCombinedModal(true);
    } catch (err) {
      console.error("Error generating article:", err);
      setCombinedArticle("Error generating article. Please try again.");
      setShowCombinedModal(true);
    } finally {
      setGeneratingSingleId(null);
    }
  }

  // Lightweight frontend analysis (same logic as backend) to populate side-panel bars
  function analyzeArticleFrontend(article) {
    const text = ((article.title || "") + " " + (article.description || "") + " " + (article.content || "")).toLowerCase();
    let biasScore = 50;
    let credibility = 75;
    let biasCategory = "center";

    const reputableSources = ["bbc", "reuters", "ap news", "associated press", "times of india", "the hindu", "nyt", "new york times"];
    const questionableSources = ["medium", "blog", "wordpress", "unverified"];
    const src = (article.source?.name || "").toLowerCase();
    if (reputableSources.some(s => src.includes(s))) credibility = 85;
    else if (questionableSources.some(s => src.includes(s))) credibility = 45;

    const leftWords = ["progressive","liberal","climate","workers","welfare","inequality"];
    const rightWords = ["conservative","traditional","law and order","sovereignty","business","tax"];
    let left=0,right=0,neutral=0;
    leftWords.forEach(w=> { if (text.includes(w)) left+=1; });
    rightWords.forEach(w=> { if (text.includes(w)) right+=1; });
    if (text.includes("according to")||text.includes("reported")||text.includes("data")) neutral+=1;

    if (left>right) { biasScore = Math.max(0, 40 - left*2); biasCategory = "left"; }
    else if (right>left) { biasScore = Math.min(100, 60 + right*2); biasCategory = "right"; }
    else { biasScore = 50; biasCategory = "center"; }

    return { biasScore, credibility, biasCategory };
  }

  // Render combinedArticle text: support markdown-like bold lines wrapped
  function renderArticleContent(text) {
    if (!text) return <div>No content</div>;
    const lines = text.split('\n').filter(Boolean);
    return (
      <div>
        {lines.map((ln, idx) => {
          const trimmed = ln.trim();
          if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
            const inner = trimmed.replace(/^\*\*/, '').replace(/\*\*$/, '');
            return <h3 key={idx} style={{ color: '#06b6d4', marginTop: idx===0?0:12 }}>{inner}</h3>;
          }
          return <p key={idx} style={{ margin: '8px 0' }}>{ln}</p>;
        })}
      </div>
    );
  }

  if (!showNews) return null;

  const getBiasColor = (biasCategory) => {
    if (biasCategory === "left") return { bar: "#3b82f6", glow: "rgba(59,130,246,0.45)" };
    if (biasCategory === "right") return { bar: "#ef4444", glow: "rgba(239,68,68,0.45)" };
    return { bar: "#8b5cf6", glow: "rgba(139,92,246,0.5)" };
  };

  return (
    <>
      <motion.aside
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        exit={{ x: "-100%" }}
        transition={{ type: "spring", damping: 24, stiffness: 200 }}
        className="news-panel unified-left-panel"
        style={{ zIndex: 1100 }}
      >
        <div className="panel-glow" />

        <div className="panel-container">
          {/* header */}
          <div className="panel-header">
            <div className="header-left">
              <motion.div className="header-icon" animate={{ boxShadow: ["0 0 20px rgba(6,182,212,0.3)", "0 0 40px rgba(6,182,212,0.6)"] }} transition={{ duration: 2, repeat: Infinity }}>
                <Newspaper className="icon-white" />
              </motion.div>

              <div>
                <h2 className="header-title">Sources</h2>
                <p className="header-sub">Bias Analysis · {state}</p>
              </div>
            </div>

            <motion.button className="close-btn" whileHover={{ scale: 1.04 }} onClick={onClose}>
              ×
            </motion.button>
          </div>

          {/* top stats & generate */}
          <div className="stats-row">
            <div className="analysis-mode">
              <div className="mode-chip">ANALYSIS MODE</div>
              <div className="sources-count">{articles.length} sources verified</div>
            </div>
          </div>

          <div className="panel-content">
            {loading ? (
              <div className="loading-cards">
                {[1,2,3].map(i => <div key={i} className="loading-card"></div>)}
              </div>
            ) : (
              articles.map((a, index) => {
                const analysis = a._analysis || { biasScore: 50, credibility: 50, biasCategory: "center", biasDescription: "" };
                const biasColor = getBiasColor(analysis.biasCategory);

                return (
                  <motion.div key={a._localId || a.url || index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.04 }} className="article-card unified-article-card">
                    <div className="article-top-row">
                      <div className="title-left">
                        <span className="source-badge">{a?.source?.name || "Unknown"}</span>
                        <h3 className="article-title">{a.title}</h3>
                      </div>

                      <div className="meta-inline">
                        <span className="meta-small"><Clock className="meta-icon" /> {a.publishedAt ? (new Date(a.publishedAt).toLocaleString()) : "—"}</span>
                      </div>
                    </div>

                    <p className="article-summary">{a.description || (a.content ? a.content.slice(0,220) + "..." : "")}</p>

                    <div className="analysis-inline">
                      <div className="analysis-left">
                        <div className="bias-row">
                          <div className="bias-label" style={{ backgroundColor: biasColor.bar, boxShadow: `0 8px 24px ${biasColor.glow}` }}>
                            {analysis.biasCategory === "left" ? "Left-Leaning" : analysis.biasCategory === "right" ? "Right-Leaning" : "Balanced"}
                          </div>
                          <div className="bias-meta">Political Bias • {Math.round(analysis.biasScore ?? 50)}/100</div>
                        </div>

                        <div className="bar-group">
                          <div className="bar-bg small">
                            <motion.div className="bar-fill" style={{ backgroundColor: biasColor.bar }} initial={{ width: 0 }} animate={{ width: `${Math.max(0, Math.min(100, analysis.biasScore ?? 50))}%` }} transition={{ duration: 0.9 }} />
                          </div>
                        </div>

                        <div className="bar-group" style={{ marginTop: 10 }}>
                          <div className="bar-title">Reliability</div>
                          <div className="bar-bg small">
                            <motion.div className="bar-fill-green" initial={{ width: 0 }} animate={{ width: `${Math.max(0, Math.min(100, analysis.credibility ?? 50))}%` }} transition={{ duration: 0.9 }} />
                          </div>
                        </div>

                      </div>

                      <div className="analysis-right">
                        <a className="read-link" href={a.url} target="_blank" rel="noreferrer">Read full article <ExternalLink className="meta-icon" /></a>

                        <button className="generate-btn" onClick={() => generateArticle(a)} disabled={generatingSingleId === (a._localId || a.url || index)}>
                          {generatingSingleId === (a._localId || a.url || index) ? "Generating..." : "Generate summary for this article"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </motion.aside>

      {showCombinedModal && (
        <div className="ai-modal-overlay">
          <div className="ai-modal">
            <div className="ai-modal-header">
              <h2>Combined AI Article</h2>
              <button className="close-small" onClick={() => setShowCombinedModal(false)}>×</button>
            </div>

            <div className="ai-modal-body">
              <div style={{ color: 'white', lineHeight: 1.6 }}>
                {renderArticleContent(combinedArticle)}
              </div>

              <div className="ai-modal-footer">
                <div className="meta-small">Credibility: <strong>{modalMetrics.credibilityScore ?? modalMetrics.credibility}/100</strong></div>
                <div className="meta-small">Bias: <strong>{modalMetrics.biasCategory === "left" ? "Left-Leaning" : modalMetrics.biasCategory === "right" ? "Right-Leaning" : "Balanced"} ({modalMetrics.biasScore}/100)</strong></div>
              </div>
            </div>
          </div>

          <div className="ai-modal-backdrop" onClick={() => setShowCombinedModal(false)} />
        </div>
      )}
    </>
  );
}
