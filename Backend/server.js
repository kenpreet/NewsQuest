import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import geminiRoutes from "./routes/geminiRoutes.js";
import newsRoutes from "./routes/newsRoutes.js";

dotenv.config();
const app = express();

const allowedOrigins = [
  "https://news-quest-theta.vercel.app",
  "https://newsquest-6kr0.onrender.com",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000"
];

if (process.env.FRONTEND_URL && !allowedOrigins.includes(process.env.FRONTEND_URL)) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked for origin: ${origin}`);
      callback(new Error("CORS not allowed"));
    }
  },
  methods: "GET,POST,PUT,DELETE",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

connectDB();

app.use("/api/news", newsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/gemini", geminiRoutes);

app.get("/", (req, res) => {
  res.send("API is running successfully!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
