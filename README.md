# NewsQuest - AI-Powered News Analysis Platform

A real-time news aggregation and analysis platform with AI-generated summaries and bias detection.

## Features

- 🗞️ Real-time news fetching from GNews API
- 🤖 AI-powered article summarization and generation
- 📊 Bias and credibility scoring
- 🗺️ India state-based news filtering
- 🔐 User authentication with JWT
- 🎨 Modern, interactive UI with Framer Motion

## Tech Stack

**Frontend:**
- React 18 + Vite
- Framer Motion (animations)
- Lucide Icons
- Mapbox (state visualization)

**Backend:**
- Node.js + Express
- MongoDB (database)
- Python (news pipeline)
- JWT authentication

**APIs:**
- GNews API (news source)
- Google Gemini (AI-powered summaries)

## Setup

### Prerequisites
- Node.js 16+
- Python 3.8+
- MongoDB Atlas account
- GNews API key

### Backend Setup

1. Navigate to backend folder:
```bash
cd Backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Fill in your environment variables:
```
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
GNEWS_API_KEY=your_gnews_key
```

5. Start backend (development):
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend folder:
```bash
cd Frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start frontend (development):
```bash
npm run dev
```

Frontend will run on `http://localhost:5173` (or next available port)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify JWT token

### Article Generation
- `POST /api/gemini/generate` - Generate AI summary for article
  - Body: `{ userMessage: "Generate article for: <title>", article: {...} }`
  - Response: `{ content, success, biasScore, credibilityScore, biasCategory }`

## Deployment

### Deploy to Production

**Option 1: Vercel (Frontend) + Render (Backend)**

1. Push to GitHub
2. Connect frontend to Vercel
3. Connect backend to Render
4. Set environment variables on deployment platform
5. Frontend will auto-detect backend URL

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/newsquest
JWT_SECRET=your_secret_key
GNEWS_API_KEY=your_gnews_api_key
```

### Frontend
- No .env needed - automatically detects backend from current domain in production
- In development, defaults to `http://localhost:5000`

## Troubleshooting

**News not showing:**
- Check GNews API key is valid
- Verify frontend can reach backend (check network tab)

**Article generation fails:**
- Ensure backend is running
- Check Python and dependencies are installed
- Verify MongoDB connection

**Authentication issues:**
- Clear localStorage and try logging in again
- Check JWT_SECRET is consistent across restarts

## Support

For issues, check the GitHub repository or contact the development team.
