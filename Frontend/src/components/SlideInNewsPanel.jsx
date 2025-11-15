import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Newspaper, Clock, ExternalLink } from "lucide-react";
import "./SlideInNewsPanel.css";
import { fetchNews, detectFakeNews, analyzeBiasAndCredibility, generateCombinedArticle } from "../utils/News_API&AI_HelperFunctions";

export default function SlideInNewsPanel({ state, showNews, onClose }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [combinedArticle, setCombinedArticle] = useState("");
  const [showCombinedModal, setShowCombinedModal] = useState(false);
  const [generatingSingleId, setGeneratingSingleId] = useState(null);

  useEffect(() => {
    if (!state || !showNews) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const news = await fetchNews(state + " India", 5);
        const normalized = news.map((n, i) => ({ ...n, _localId: n.url || `${state}-${i}` }));
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

  useEffect(() => {
    let cancelled = false;
    if (!articles || articles.length === 0) return;

    (async function analyzeAll() {
      const enriched = [];
      for (let i = 0; i < articles.length; i++) {
        const a = articles[i];
        if (a._analysis) {
          enriched.push(a);
          continue;
        }

        try {
          const text = a.content || a.description || "";
          const biasRes = await analyzeBiasAndCredibility(text, a?.source?.name || "Unknown");
          let biasCategory = "center";
          const desc = String(biasRes.bias_description || "").toLowerCase();
          if (desc.includes("left")) biasCategory = "left";
          else if (desc.includes("right")) biasCategory = "right";

          const analysis = {
            biasScore: biasRes.bias_score ?? 50,
            credibility: biasRes.credibility_score ?? 50,
            biasDescription: biasRes.bias_description || "",
            biasCategory,
          };

          enriched.push({ ...a, _analysis: analysis });
        } catch (err) {
          enriched.push({ ...a, _analysis: { biasScore: 50, credibility: 50, biasDescription: "N/A", biasCategory: "center" } });
        }
        if (cancelled) break;
      }
      if (!cancelled) setArticles(enriched);
    })();

    return () => { cancelled = true; };
  }, [articles.length]);


  async function generateMergedSingle(article) {
    if (!article) return;
    const id = article._localId || article.url || article.title;
    setGeneratingSingleId(id);

    try {
      const text = article.content || article.description || "";
      const source = article?.source?.name || "Unknown";
      const fakeRes = await detectFakeNews(text);
      const biasRes = await analyzeBiasAndCredibility(text, source);
      const merged = await generateCombinedArticle([{ ...article, fake: fakeRes, bias: biasRes }]);
      setCombinedArticle(merged);
      setShowCombinedModal(true);
    } catch (err) {
      console.error("Error generating merged article for single:", err);
      setCombinedArticle("Unable to generate combined article.");
      setShowCombinedModal(true);
    } finally {
      setGeneratingSingleId(null);
    }
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
              X
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

                        <button className="generate-btn" onClick={() => generateMergedSingle(a)} disabled={!!generatingSingleId}>
                          {generatingSingleId ? "Generating..." : "Generate summary for this article"}
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
              <button className="close-small" onClick={() => setShowCombinedModal(false)}><X className="meta-icon" /></button>
            </div>

            <div className="ai-modal-body">
              <pre style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{combinedArticle}</pre>

              <div className="ai-modal-footer">
                <div className="meta-small">Credibility: <strong>Auto-computed</strong></div>
                <div className="meta-small">Bias: <strong>Auto-summary</strong></div>
              </div>
            </div>
          </div>

          <div className="ai-modal-backdrop" onClick={() => setShowCombinedModal(false)} />
        </div>
      )}
    </>
  );
}
