#!/usr/bin/env python3
"""
Simple News Pipeline - Just fetch news and return it
No heavy API calls or analysis - keep it fast and simple
"""

import os
import sys
import json
import requests

# Configuration
GNEWS_API_KEY = os.getenv("GNEWS_API_KEY", "cab28e1b475601d2ae6029443f146367")

def fetch_news(query, n=5):
    """Fetch news articles from GNews API"""
    try:
        url = f"https://gnews.io/api/v4/search?q={query}&lang=en&max={n}&apikey={GNEWS_API_KEY}"
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        articles = data.get("articles", [])
        return articles
    except Exception as e:
        print(f"ERROR fetching news: {e}", file=sys.stderr)
        return []


def generate_article(articles):
    """Generate a concise extractive summary from multiple articles.

    Uses a simple frequency-based sentence scoring algorithm to pick the
    most informative sentences across titles, descriptions and content,
    then preserves their original order to form a short, coherent summary.
    """
    if not articles:
        return "No articles found for the given query."

    # Collect text pool (title, description, content) from all articles
    pool_sentences = []
    sentence_articles = []  # map sentence index -> article source name

    import re

    def split_sentences(text):
        # naive sentence splitter that keeps punctuation
        if not text:
            return []
        text = text.replace('\r', ' ').replace('\n', ' ')
        parts = re.split(r'(?<=[.!?])\s+', text)
        return [p.strip() for p in parts if p.strip()]

    for art in articles:
        src = art.get("source", {}).get("name", "Unknown")
        title = art.get("title") or ""
        desc = art.get("description") or ""
        content = art.get("content") or ""

        # Prefer longer fields first so titles/descriptions still contribute
        for text in (title, desc, content):
            sents = split_sentences(text)
            for s in sents:
                pool_sentences.append(s)
                sentence_articles.append(src)

    if not pool_sentences:
        return "No usable text found in fetched articles."

    # Simple word-frequency scoring (extractive summarizer)
    stopwords = {
        'the','and','to','of','in','a','is','for','on','that','with','as','are',
        'was','by','it','at','from','an','be','this','which','have','has','or'
    }

    word_freq = {}
    for sent in pool_sentences:
        for w in re.findall(r"\w+", sent.lower()):
            if w in stopwords or len(w) < 2:
                continue
            word_freq[w] = word_freq.get(w, 0) + 1

    # score each sentence by summing word frequencies
    sent_scores = []
    for idx, sent in enumerate(pool_sentences):
        score = 0
        for w in re.findall(r"\w+", sent.lower()):
            score += word_freq.get(w, 0)
        sent_scores.append((idx, score))

    # choose top K sentences by score
    TARGET_SENTENCES = 8
    # If there are fewer sentences than target, just use all
    k = min(TARGET_SENTENCES, len(sent_scores))
    # sort by score descending and pick top k indices
    top_indices = sorted(sorted(sent_scores, key=lambda x: x[1], reverse=True)[:k], key=lambda x: x[0])
    chosen_idxs = [idx for idx, _ in top_indices]

    # Build the summary preserving original order
    summary_sentences = [pool_sentences[i] for i in chosen_idxs]

    # Create heading from the most common title or the first article's title
    heading = None
    for art in articles:
        if art.get('title'):
            heading = art.get('title')
            break
    if not heading:
        heading = "News Summary"

    # Build sources list (unique)
    sources = []
    for art in articles:
        src = art.get('source', {}).get('name', 'Unknown')
        if src not in sources:
            sources.append(src)

    final_article = f"**{heading}**\n\n"
    # Join sentences into paragraphs aiming for concise but informative output
    final_article += " ".join(summary_sentences)
    final_article += "\n\n**Sources:** " + ", ".join(sources)

    return final_article or "Could not generate article from available sources."


def main():
    """Main entry point"""
    try:
        # Read input from stdin
        input_data = sys.stdin.read()
        request = json.loads(input_data)
        
        query = request.get("query", "news")
        num_articles = request.get("num_articles", 5)
        
        # Fetch articles
        articles = fetch_news(query, num_articles)
        
        # Generate article content
        content = generate_article(articles)
        
        # Return result
        result = {
            "success": True,
            "content": content,
            "sources_count": len(articles),
            "articles_analyzed": len(articles)
        }
        
        print(json.dumps(result, ensure_ascii=False))
        sys.exit(0)
        
    except json.JSONDecodeError as e:
        result = {
            "success": False,
            "content": f"Invalid JSON input: {e}",
            "sources_count": 0,
            "articles_analyzed": 0
        }
        print(json.dumps(result, ensure_ascii=False))
        sys.exit(0)
    except Exception as e:
        result = {
            "success": False,
            "content": f"Error: {str(e)}",
            "sources_count": 0,
            "articles_analyzed": 0
        }
        print(json.dumps(result, ensure_ascii=False))
        sys.exit(0)


if __name__ == "__main__":
    main()
