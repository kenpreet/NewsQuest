import os
import json
import requests
from datetime import datetime
import google.generativeai as genai

# --- macOS-safe setup ---
os.environ["TOKENIZERS_PARALLELISM"] = "false"
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"

# -------------------------
# CONFIGURATION
# -------------------------
GNEWS_API_KEY = "40445fddd77e99c49929ba261d885df0"
GEMINI_API_KEY = "AIzaSyC-2dZKkePOnxppleuZOHL_QFDqIK62kZU"
genai.configure(api_key=GEMINI_API_KEY)

TOPIC = "global warming"
NUM_ARTICLES = 5


# -------------------------
# 1. FETCH NEWS
# -------------------------
def fetch_news(query, n=5):
    print(f"[+] Fetching {n} news articles for topic: {query}")
    url = f"https://gnews.io/api/v4/search?q={query}&lang=en&max={n}&apikey={GNEWS_API_KEY}"
    response = requests.get(url)
    data = response.json()
    articles = data.get("articles", [])
    print(f"  ↳ Retrieved {len(articles)} articles.")
    return articles


# -------------------------
# 2. FAKE NEWS DETECTION (Gemini-based)
# -------------------------
print("[+] Initializing Gemini-based fake news detection...")

def detect_fake_news(text):
    if not text or text.strip() == "":
        return {"label": "unknown", "confidence": 0.0}

    model = genai.GenerativeModel("gemini-2.5-flash")
    prompt = f"""
    You are an expert in misinformation detection.
    Analyze the following text and determine if it is likely to be fake or factual.

    Return ONLY a JSON object with these exact keys:
    - label: one of ["FAKE", "REAL", "UNCERTAIN"]
    - confidence: a number between 0 and 1 indicating confidence in your judgment

    Text:
    {text}
    """

    try:
        response = model.generate_content(prompt)
        return json.loads(response.text.strip())
    except Exception:
        return {"label": "UNCERTAIN", "confidence": 0.5}


# -------------------------
# 3. GEMINI - BIAS & CREDIBILITY ANALYSIS
# -------------------------

import re

def extract_json_from_response(text):
    """Extract valid JSON even if wrapped in markdown or text."""
    if not text:
        return None
    # Find JSON block inside triple backticks
    match = re.search(r"```json\s*(\{.*?\})\s*```", text, re.DOTALL)
    if match:
        text = match.group(1)
    # Remove any non-JSON noise before/after braces
    text = text.strip()
    if text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    try:
        return json.loads(text)
    except Exception:
        return None

def analyze_bias_credibility(article_text, source):
    prompt = f"""
    You are a media analysis expert. Analyze the following news article from {source}.
    Return a JSON with these exact keys:
    bias_score (0–100, where 0 = unbiased, 100 = heavily biased)
    credibility_score (0–100, where 100 = highly credible)
    bias_description

    Article:
    {article_text}
    """

    model = genai.GenerativeModel("gemini-2.5-flash")
    response = model.generate_content(prompt)
    text = response.text.strip()

    parsed = extract_json_from_response(text)
    if parsed:
        return parsed
    else:
        return {
            "bias_score": None,
            "credibility_score": None,
            "bias_description": text
        }



# -------------------------
# 4. COMBINE RESULTS
# -------------------------
def build_article_metadata(article, fake_result, llm_result):
    return {
        "title": article.get("title"),
        "source": article.get("source", {}).get("name"),
        "url": article.get("url"),
        "publishedAt": article.get("publishedAt"),
        "description": article.get("description"),
        "content": article.get("content"),
        "fake_news_label": fake_result["label"],
        "fake_confidence": fake_result["confidence"],
        "bias_score": llm_result.get("bias_score"),
        "credibility_score": llm_result.get("credibility_score"),
        "bias_description": llm_result.get("bias_description"),
    }


# -------------------------
# 5. MERGE ARTICLES INTO ONE
# -------------------------
def merge_news_articles(news_json):
    prompt = f"""
    You are a balanced journalist AI.
    You are given multiple news reports about the same topic.
    Each includes bias and credibility information.

    Task:
    - Write a single, factual, neutral, and well-balanced article that fairly represents all viewpoints.
    - Summarize consistent facts across reports.
    - If sources disagree, mention both perspectives clearly.
    - Avoid political or emotional tone.

    Input JSON:
    {news_json}
    """

    model = genai.GenerativeModel("gemini-2.5-flash")
    response = model.generate_content(prompt)
    return response.text.strip()


# -------------------------
# 6. MAIN PIPELINE
# -------------------------
def main():
    # print("\n=== AI News Credibility Aggregator (Gemini Version) ===\n")

    articles = fetch_news(TOPIC, NUM_ARTICLES)

    all_results = []
    for i, article in enumerate(articles, start=1):
        # print(f"\nProcessing Article {i}/{len(articles)}: {article.get('title', 'Untitled')}")

        content = article.get("content") or article.get("description") or ""
        fake_result = detect_fake_news(content)
        llm_result = analyze_bias_credibility(content, article.get("source", {}).get("name"))

        combined = build_article_metadata(article, fake_result, llm_result)
        all_results.append(combined)

    json_data = json.dumps(all_results, indent=2)
    filename = f"news_analysis_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(filename, "w") as f:
        f.write(json_data)
    # print(f"\n[+] Saved analysis metadata to {filename}")

    # print("[+] Synthesizing final balanced news article using Gemini...")
    final_article = merge_news_articles(json_data)

    # print("\n=== FINAL COMBINED ARTICLE ===\n")
    # print(final_article)

    return final_article


if __name__ == "__main__":
    print(main())
