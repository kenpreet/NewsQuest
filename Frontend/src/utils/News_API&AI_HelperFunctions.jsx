// Get backend URL from environment or detect from domain
const getBackendUrl = () => {
  // Use Vite env variable if available
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }
  // Fallback: auto-detect
  if (typeof window === 'undefined') return 'http://localhost:5000';
  const { protocol, hostname } = window.location;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }
  return `${protocol}//${hostname}`;
};

export async function fetchNews(query, n = 5) {
  try {
    const backendUrl = getBackendUrl();
    const url = `${backendUrl}/api/news/search?q=${encodeURIComponent(query)}&n=${n}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.articles || [];
  } catch (error) {
    console.error("News fetch error:", error);
    return [];
  }
}

export async function generateArticleFromPipeline(query, article = null) {
  try {
    const backendUrl = getBackendUrl();
    const response = await fetch(
      `${backendUrl}/api/gemini/generate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage: `Generate article for: ${query}`,
          article: article
        }),
      }
    );
    const json = await response.json();
    const content = json?.content || "No article generated";
    const metrics = {
      biasScore: json?.biasScore ?? 50,
      credibilityScore: json?.credibilityScore ?? json?.credibility ?? 75,
      biasCategory: json?.biasCategory ?? "center"
    };

    return { content, metrics };
  } catch (error) {
    console.error("Pipeline error:", error);
    return { content: "Error generating article", metrics: { biasScore: 50, credibilityScore: 75, biasCategory: 'center' } };
  }
}
