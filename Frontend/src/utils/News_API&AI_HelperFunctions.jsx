import { useState } from "react";

const GNEWS_API_KEY = "05c0e36e21f75364b136d9263e86d68d";
const GEMINI_API_KEY = "AIzaSyC-2dZKkePOnxppleuZOHL_QFDqIK62kZU";


export async function fetchNews(query, n = 5) {
  const url = `https://gnews.io/api/v4/search?q=${query}&lang=en&max=${n}&apikey=${GNEWS_API_KEY}`;

  const res = await fetch(url);
  const data = await res.json();

  return data.articles || [];
}

async function callGemini(prompt) {
  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-latest:generateContent?key=" + GEMINI_API_KEY,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  const json = await response.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return text.trim();
}

export async function detectFakeNews(text) {
  if (!text || text.trim() === "") {
    return { label: "UNCERTAIN", confidence: 0.0 };
  }

  const prompt = `
You are an expert in misinformation detection.
Analyze the text and return ONLY a JSON object:

{
  "label": "FAKE" | "REAL" | "UNCERTAIN",
  "confidence": number (0 to 1)
}

Text:
${text}
  `;

  try {
    const raw = await callGemini(prompt);
    return JSON.parse(raw);
  } catch {
    return { label: "UNCERTAIN", confidence: 0.5 };
  }
}

function extractJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function analyzeBiasAndCredibility(content, source) {
  const prompt = `
You are a media analysis expert.
Return JSON in this format:

{
 "bias_score": number (0-100),
 "credibility_score": number (0-100),
 "bias_description": "string"
}

Source: ${source}
Article:
${content}
  `;

  const text = await callGemini(prompt);
  const parsed = extractJson(text);

  if (parsed) return parsed;

  return {
    bias_score: null,
    credibility_score: null,
    bias_description: text,
  };
}

function buildMetadata(article, fakeResult, biasResult) {
  return {
    title: article.title,
    source: article?.source?.name,
    url: article.url,
    publishedAt: article.publishedAt,
    description: article.description,
    content: article.content,
    fake_news_label: fakeResult.label,
    fake_confidence: fakeResult.confidence,
    bias_score: biasResult.bias_score,
    credibility_score: biasResult.credibility_score,
    bias_description: biasResult.bias_description,
  };
}

export async function runFullPipeline(topic = "global warming", count = 5) {
  const articles = await fetchNews(topic, count);
  const results = [];

  for (const article of articles) {
    const content = article.content || article.description || "";

    const fakeRes = await detectFakeNews(content);
    const biasRes = await analyzeBiasAndCredibility(content, article?.source?.name);

    results.push(buildMetadata(article, fakeRes, biasRes));
  }

  return results; 
}

export async function generateCombinedArticle(jsonData) {
  const prompt = `
You are a balanced journalist AI.
Write a neutral, factual combined news article using:

${JSON.stringify(jsonData)}

Rules:
- Summarize consistent facts.
- If sources disagree, show both perspectives.
- No emotional or political tone.
  `;

  const result = await callGemini(prompt);
  return result;
}
