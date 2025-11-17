const GNEWS_API_KEY = "31aec11820766482a0bfe118571c2fe1";

export async function fetchNews(query, n = 5) {
  const url = `https://gnews.io/api/v4/search?q=${query}&lang=en&max=${n}&apikey=${GNEWS_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.articles || [];
}

// Call Python pipeline via backend to generate article
export async function generateArticleFromPipeline(query, article = null) {
  try {
    const response = await fetch(
      "http://localhost:5000/api/gemini/generate",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage: `Generate article for: ${query}`,
          article: article  // Send the article as fallback
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
