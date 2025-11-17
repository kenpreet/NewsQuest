const GNEWS_API_KEY = "31aec11820766482a0bfe118571c2fe1";

// Detect backend URL: use current domain in production, localhost in development
const getBackendUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:5000';
  const { protocol, hostname, port } = window.location;
  // In production, backend is at same domain; in dev, use localhost:5000
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }
  // Production: assume backend is at same domain (e.g., yourdomain.com/api)
  return `${protocol}//${hostname}`;
};

export async function fetchNews(query, n = 5) {
  const url = `https://gnews.io/api/v4/search?q=${query}&lang=en&max=${n}&apikey=${GNEWS_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.articles || [];
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
