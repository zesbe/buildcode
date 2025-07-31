# Chat AI Percobaan

Modern chat application with AI integration, organized with separate backend and frontend for easy deployment.

## 🚀 Quick Deploy

### Backend (Railway)
[![Deploy Backend](https://railway.app/button.svg)](https://railway.app/new/template?template=https%3A%2F%2Fgithub.com%2Fzesbe%2Fchat-ai-percobaan&envs=ANTHROPIC_API_KEY&envDescription=Claude%20API%20Key&envLink=https%3A%2F%2Fconsole.anthropic.com&referralCode=railway)

### Frontend (Vercel)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fzesbe%2Fchat-ai-percobaan&project-name=chat-ai-frontend&repository-name=chat-ai-frontend&root-directory=frontend&env=NEXT_PUBLIC_API_URL,ANTHROPIC_API_KEY&envDescription=Backend%20API%20URL%20and%20Claude%20API%20Key)

### Frontend (Railway)
[![Deploy Frontend on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https%3A%2F%2Fgithub.com%2Fzesbe%2Fchat-ai-percobaan&envs=NEXT_PUBLIC_API_URL,ANTHROPIC_API_KEY&envDescription=Backend%20API%20URL%20and%20Claude%20API%20Key)

## Project Structure

```
chat-ai-percobaan/
├── backend/          # Express.js API server
├── frontend/         # Next.js React application
├── scripts/          # Deployment and utility scripts
├── docs/            # Documentation and deployment guides
├── contoh-apps/     # Sample applications
└── README.md        # This file
```

## Quick Start

### Development
```bash
# Install all dependencies
npm run install:all

# Run both backend and frontend in development mode
npm run dev
```

### Backend Only
```bash
cd backend
npm install
npm run dev
```

### Frontend Only
```bash
cd frontend
npm install
npm run dev
```

## Deployment

### Railway Deployment

#### Deploy Backend Only
```bash
cd backend
railway up
```

#### Deploy Frontend Only
```bash
cd frontend
railway up
```

#### Deploy Frontend to Railway
```bash
cd frontend
railway up
```

#### Deploy Both (Monorepo Style)
```bash
# From root directory
railway up
```

## Environment Variables

### Backend
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 3002)
- `ANTHROPIC_API_KEY` - Claude API key

### Frontend
- `NEXT_PUBLIC_API_URL` - Backend API URL

## Documentation

See `docs/deployment/` for detailed deployment guides:
- Railway deployment guide
- Vercel deployment guide
- Netlify deployment guide