// Get backend URL from environment or detect from domain
const getBackendUrl = () => {
  // Use Vite env variable if available
  const envUrl = import.meta.env.VITE_BACKEND_URL;
  console.log("[Helper] Checking VITE_BACKEND_URL:", envUrl);
  
  if (envUrl) {
    console.log("[Helper] Using environment backend URL:", envUrl);
    return envUrl;
  }
  
  // Fallback: auto-detect
  if (typeof window === 'undefined') return 'http://localhost:5000';
  
  const { protocol, hostname } = window.location;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    console.log("[Helper] Using localhost fallback");
    return 'http://localhost:5000';
  }
  
  const fallbackUrl = `${protocol}//${hostname}`;
  console.log("[Helper] Using fallback URL:", fallbackUrl);
  return fallbackUrl;
};

export async function fetchNews(query, n = 5) {
  try {
    const backendUrl = getBackendUrl();
    const url = `${backendUrl}/api/news/search?q=${encodeURIComponent(query)}&n=${n}`;
    console.log("[fetchNews] Calling:", url);
    
    const res = await fetch(url);
    console.log("[fetchNews] Response status:", res.status);
    
    const data = await res.json();
    console.log("[fetchNews] Response data articles count:", data.articles?.length || 0);
    
    return data.articles || [];
  } catch (error) {
    console.error("[fetchNews] Error:", error);
    return [];
  }
}

export async function generateArticleFromPipeline(query, article = null) {
  try {
    const backendUrl = getBackendUrl();
    const url = `${backendUrl}/api/gemini/generate`;
    console.log("[generateArticle] Calling:", url);
    
    const response = await fetch(
      url,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage: `Generate article for: ${query}`,
          article: article
        }),
      }
    );
    
    console.log("[generateArticle] Response status:", response.status);
    
    const json = await response.json();
    console.log("[generateArticle] Response data:", json);
    
    const content = json?.content || "No article generated";
    const metrics = {
      biasScore: json?.biasScore ?? 50,
      credibilityScore: json?.credibilityScore ?? json?.credibility ?? 75,
      biasCategory: json?.biasCategory ?? "center"
    };

    return { content, metrics };
  } catch (error) {
    console.error("[generateArticle] Error:", error);
    return { content: "Error generating article", metrics: { biasScore: 50, credibilityScore: 75, biasCategory: 'center' } };
  }
}
