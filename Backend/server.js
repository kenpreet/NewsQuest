import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import geminiRoutes from "./routes/geminiRoutes.js";

dotenv.config();
const app = express();

// Middlewares
app.use(cors({
  origin: [
    "https://news-quest-theta.vercel.app",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000"
  ],
  methods: "GET,POST,PUT,DELETE",
  credentials: true
}));
app.use(express.json());

// Connect MongoDB
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/gemini", geminiRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("API is running successfully!");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
