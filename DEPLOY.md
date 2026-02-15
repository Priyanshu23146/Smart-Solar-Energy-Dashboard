# Deployment Guide - Smart Solar Energy Dashboard

This guide explains how to build and deploy your full-stack application.

## Prerequisites
- Node.js (v18 or higher)
- NPM (v9 or higher)

## Project Structure
Your project is set up as a monorepo-style full stack app:
- **Frontend** (`/`): React + Vite
- **Backend** (`/server`): Express + TypeScript

In production, the Backend serves the Frontend static files, allowing you to deploy everything as a single service.

## 1. Build for Production

Open a terminal in the project root and run:

```bash
# 1. Install all dependencies
npm run install:all

# 2. Build Frontend (creates /dist)
npm run build

# 3. Build Backend (creates /server/dist)
cd server
npm run build
cd ..
```

## 2. Local Production Test

To test the production build locally:

```bash
# Start the backend server (which serves the frontend)
node server/dist/index.js
```
Visit `http://localhost:5000` to see your app running in production mode!

## 3. Deploy to Render / Heroku / Railway

These platforms detect `package.json` in the root. You need to tell them how to build and start your app.

### Configuration (Environment Variables)
Set these variables in your deployment platform:
- `NODE_ENV`: `production`

### Build Command
The platform needs to build both parts. Use this command:
```bash
npm install && npm install --prefix server && npm run build && cd server && npm run build
```

### Start Command
```bash
node server/dist/index.js
```

## 4. Database Warning
> [!WARNING]
> This app uses a **file-based database** (`server/data/db.json`).
> On most cloud platforms (Render, Vercel, Heroku), the filesystem is **ephemeral**.
> This means **all users and data will be wiped** every time you redeploy or the server restarts.
> 
> **For a real production app**, you must switch to a database like MongoDB Atlas or PostgreSQL.

## 5. Security Note
Your app now uses `bcryptjs` for password hashing.
- Ensure you set a strong secret if you implement JWT in the future.
- The repository should **not** include `.env` files (add them to `.gitignore`).
