# 🫙💕 Game Night Jar

A Valentine's Day app for picking board games from your collection! Import your BoardGameGeek library, filter by categories, and let the jar pick your next game night adventure.

## Features

- **🫙 Game Jar** — Tap the jar to randomly draw a game from your collection
- **🔍 Smart Filters** — Filter by "Never Played", "Favorites", BGG categories, and more
- **📚 BGG Import** — Load your full BoardGameGeek collection with categories and metadata
- **👆 First Player Picker** — Everyone places a finger on the screen, and one is chosen to go first!

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) on your phone or computer.

## Deploy to Vercel

### Option A: Via GitHub

1. Push this project to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "New Project" → Import your repo
4. Click "Deploy" — that's it!

### Option B: Via Vercel CLI

```bash
npm i -g vercel
vercel
```

Follow the prompts and your app will be live in seconds.

## How It Works

- The BGG XML API doesn't support CORS, so the app uses Next.js API routes (`/api/bgg/*`) as a server-side proxy
- Your game collection is stored in your browser's localStorage
- The first player picker uses multi-touch events — each person places a finger on the screen, and after 3 seconds of stability, a winner is chosen

## Tech Stack

- Next.js 14 (App Router)
- Vanilla CSS with Google Fonts (Caveat + Nunito)
- BoardGameGeek XML API v2
- Deployed on Vercel

---

Made with 💕
