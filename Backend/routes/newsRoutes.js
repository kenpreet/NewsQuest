import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.get("/search", async (req, res) => {
  const query = req.query.q || "";
  const n = req.query.n || 5;
  const apiKey = process.env.GNEWS_API_KEY;

  try {
    const url = `https://gnews.io/api/v4/search?q=${query}&lang=en&max=${n}&apikey=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    return res.json(data);
  } catch (err) {
    console.error("GNews error:", err);
    return res.status(500).json({ error: "Failed to fetch news" });
  }
});

export default router;
