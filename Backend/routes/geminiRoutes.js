import express from "express";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Helper function to analyze bias and credibility
function analyzeArticle(article) {
  let biasScore = 50;  // Default neutral
  let credibilityScore = 75;  // Default decent
  let biasCategory = "center";
  
  if (!article) return { biasScore, credibilityScore, biasCategory };
  
  const title = (article.title || "").toLowerCase();
  const description = (article.description || "").toLowerCase();
  const source = (article.source?.name || "").toLowerCase();
  const content = (article.content || "").toLowerCase();
  const text = title + " " + description + " " + content;
  
  // Analyze source credibility
  const reputableSources = ["bbc", "reuters", "ap news", "associated press", "times of india", "the hindu", "nyt", "new york times"];
  const questionableSources = ["medium", "blog", "wordpress", "unverified"];
  
  if (reputableSources.some(s => source.includes(s))) {
    credibilityScore = 85;
  } else if (questionableSources.some(s => source.includes(s))) {
    credibilityScore = 45;
  }
  
  // Analyze bias from language
  const leftLeaningWords = ["progressive", "liberal", "equal rights", "climate change", "workers", "welfare"];
  const rightLeaningWords = ["conservative", "traditional", "law and order", "sovereignty", "business friendly"];
  const neutralWords = ["according to", "reported", "data shows", "analysis", "research"];
  
  let leftCount = 0;
  let rightCount = 0;
  let neutralCount = 0;
  
  leftLeaningWords.forEach(word => {
    if (text.includes(word)) leftCount += 2;
  });
  
  rightLeaningWords.forEach(word => {
    if (text.includes(word)) rightCount += 2;
  });
  
  neutralWords.forEach(word => {
    if (text.includes(word)) neutralCount += 1;
  });
  
  // Calculate bias score (0-100, where 50 is neutral)
  if (leftCount > rightCount) {
    biasScore = 30 + (leftCount * 2);
    biasCategory = "left";
  } else if (rightCount > leftCount) {
    biasScore = 50 + (rightCount * 2);
    biasCategory = "right";
  } else if (neutralCount > leftCount && neutralCount > rightCount) {
    biasScore = 50;
    biasCategory = "center";
  }
  
  // Clamp values
  biasScore = Math.max(0, Math.min(100, biasScore));
  credibilityScore = Math.max(0, Math.min(100, credibilityScore));
  
  return { biasScore, credibilityScore, biasCategory };
}

// Simple extractive summarizer for fallback (keeps summaries concise and informative)
function summarizeText(text, targetSentences = 7) {
  if (!text || typeof text !== 'string') return '';
  const stopwords = new Set(['the','and','to','of','in','a','is','for','on','that','with','as','are','was','by','it','at','from','an','be','this','which','have','has','or']);
  const sentences = text.replace(/\r|\n/g, ' ').split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(s => s.length > 20);
  if (sentences.length === 0) return '';
  const wordFreq = {};
  const wordRegex = /\w+/g;
  sentences.forEach(s => {
    const words = s.toLowerCase().match(wordRegex) || [];
    words.forEach(w => {
      if (stopwords.has(w) || w.length < 2) return;
      wordFreq[w] = (wordFreq[w] || 0) + 1;
    });
  });
  const scores = sentences.map((s, i) => {
    let score = 0;
    const words = s.toLowerCase().match(wordRegex) || [];
    words.forEach(w => { score += (wordFreq[w] || 0); });
    return { i, score };
  });
  const k = Math.min(targetSentences, scores.length);
  const top = scores.sort((a,b) => b.score - a.score).slice(0, k).sort((a,b) => a.i - b.i);
  const chosen = top.map(t => sentences[t.i]);
  return chosen.join(' ');
}

// Helper: Run Python news pipeline with timeout
function runNewsPipeline(query, numArticles = 5) {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, "../news_pipeline_simple.py");
    
    const pythonProcess = spawn("python", [pythonScript], {
      env: { ...process.env, PYTHONUNBUFFERED: "1" }
    });

    let output = "";
    let errorOutput = "";
    let timedOut = false;

    // 60 second timeout
    const timeout = setTimeout(() => {
      timedOut = true;
      pythonProcess.kill();
      reject(new Error("Python pipeline timeout (60s)"));
    }, 60000);

    pythonProcess.stdout.on("data", (data) => { output += data.toString(); });
    pythonProcess.stderr.on("data", (data) => { errorOutput += data.toString(); });

    pythonProcess.on("close", (code) => {
      clearTimeout(timeout);
      if (timedOut) return;

      if (code !== 0) {
        reject(new Error(`Python failed: ${errorOutput.substring(0, 200)}`));
        return;
      }

      try {
        if (!output.trim()) return reject(new Error("Python produced no output"));
        
        // Extract JSON from output (may have warnings before it)
        const jsonMatch = output.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.error("No JSON found in output:", output.substring(0, 200));
          reject(new Error("No JSON output from Python"));
          return;
        }
        
        const result = JSON.parse(jsonMatch[0]);
        resolve(result);
      } catch (e) {
        reject(new Error("Failed to parse Python JSON: " + e.message));
      }
    });

    pythonProcess.on("error", (err) => { clearTimeout(timeout); reject(new Error("Failed to spawn Python: " + err.message)); });
    pythonProcess.stdin.write(JSON.stringify({ query, num_articles: numArticles }));
    pythonProcess.stdin.end();
  });
}

router.post("/generate", async (req, res) => {
  try {
    const { userMessage, article } = req.body || {};

    if (!userMessage || typeof userMessage !== "string") {
      return res.status(400).json({ error: "userMessage is required" });
    }

    // Extract query from message
    let query = userMessage.replace("Generate article for:", "").trim();
    if (!query) query = "global news";

    try {
      const result = await runNewsPipeline(query, 5);
      
      
      // If no articles found, use the provided article as fallback
      let content = result.content;
      let biasScore = 50;
      let credibilityScore = 75;
      let biasCategory = "center";
      
      if (content === "No articles found for the given query." && article) {
          const analysis = analyzeArticle(article);
          biasScore = analysis.biasScore;
          credibilityScore = analysis.credibilityScore;
          biasCategory = analysis.biasCategory;

        const title = article.title || "Article";
        const source = article.source?.name || "Unknown Source";
        const date = article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : "Unknown Date";

        // Build a combined text from title, description and content and summarize it
        const combined = [title, article.description || '', article.content || ''].join('. ');
        const summaryBody = summarizeText(combined, 7) || (article.description || article.content || 'No useful summary available.');

        // Compose the final content with heading and sources
        const parts = [];
        parts.push(`**${title}**`);
        parts.push("");
        parts.push(`Source: ${source}`);
        parts.push(`Published: ${date}`);
        parts.push("");
        parts.push(`**Summary:**`);
        parts.push(summaryBody);

        content = parts.join("\n\n");
      }
      
      return res.json({
        content: content,
        success: result.success !== false,
        sources: result.sources_count || 0,
        biasScore: biasScore,
        credibilityScore: credibilityScore,
        biasCategory: biasCategory
      });
    } catch (pipelineErr) {
      console.error("Pipeline failed:", pipelineErr.message);
      return res.status(500).json({
        error: "Pipeline execution failed",
        message: pipelineErr.message,
        success: false
      });
    }

  } catch (err) {
    console.error("Route error:", err.message);
    return res.status(500).json({
      error: "Server error",
      message: err.message,
      success: false
    });
  }
});

export default router;

