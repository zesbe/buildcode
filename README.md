# 🚀 Chat AI Percobaan - Claude 4 Codespace

Modern chat application with AI integration, featuring a VS Code-like editor and Claude AI assistance.

## 📋 Project Structure

```
chat-ai-percobaan/
├── backend/          # Express.js API server
├── frontend/         # Next.js React application
├── package.json      # Root package management
└── railway-template.json # Railway deployment template
```

## ✨ Features

### Backend (Express.js)
- **Claude AI Integration** with streaming support
- **GitHub API Integration** for repository management
- **Rate limiting** and error handling
- **Health check endpoints**
- **CORS enabled** for frontend communication

### Frontend (Next.js)
- **VS Code-like Interface** with Monaco Editor
- **AI-powered code assistance** with Claude 4
- **Real-time chat streaming** 
- **File management** with folder structure
- **Live preview** and package management
- **Dark/light theme** support
- **Mobile-responsive** design

## 🚀 Quick Start

### Local Development

1. **Install dependencies**:
   ```bash
   npm run install:all
   ```

2. **Setup environment variables**:
   ```bash
   # Backend (.env)
   ANTHROPIC_API_KEY=your_api_key_here
   GITHUB_TOKEN=your_github_token_here
   
   # Frontend
   NEXT_PUBLIC_API_URL=http://localhost:3002
   ```

3. **Run development servers**:
   ```bash
   npm run dev
   ```

### Railway Deployment

#### One-Click Deploy
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/your-template-id)

#### Manual Deploy
1. **Backend Deploy**:
   ```bash
   cd backend
   railway up
   ```

2. **Frontend Deploy**:
   ```bash
   cd frontend  
   railway up
   ```

3. **Environment Variables**:
   - Backend: `ANTHROPIC_API_KEY`
   - Frontend: `NEXT_PUBLIC_API_URL` (backend service URL)

## 🔧 Configuration

### Backend Configuration
- Port: 3002
- Health endpoint: `/api/health`
- Chat endpoint: `/api/chat`
- GitHub endpoints: `/api/github/*`

### Frontend Configuration  
- Port: 3000
- Built with Next.js 14
- Uses own API routes for Claude integration
- Independent deployment from backend

## 📊 API Endpoints

### Backend API
```
GET  /api/health     # Health check
POST /api/chat       # Chat with Claude AI
GET  /api/github/*   # GitHub integration
```

### Frontend API
```
POST /api/claude          # Claude AI direct integration
POST /api/claude-stream   # Streaming chat
GET  /api/test-*         # Test endpoints
```

## 🛠️ Tech Stack

- **Backend**: Express.js, Anthropic SDK, Octokit
- **Frontend**: Next.js, React, Monaco Editor, Tailwind CSS
- **AI**: Claude 4 (Opus & Sonnet models)
- **Deployment**: Railway, Vercel
- **Database**: File-based (localStorage for frontend)

## 🔐 Environment Variables

### Required
- `ANTHROPIC_API_KEY`: Anthropic Claude API key
- `NODE_ENV`: production/development

### Optional  
- `GITHUB_TOKEN`: GitHub API access
- `NEXT_PUBLIC_API_URL`: Backend service URL

## 📱 Usage

1. **Open the application** in your browser
2. **Select files** from the file explorer
3. **Write code** with AI assistance in Monaco editor
4. **Chat with Claude** for code help and analysis
5. **Use live preview** to see results
6. **Manage packages** with integrated package manager

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

- Check Railway logs for deployment issues
- Verify API keys are properly set
- Ensure CORS is configured for cross-origin requests
- Frontend has independent API routes and doesn't require backend for basic functionality

---

**Made with ❤️ using Claude 4 AI assistance**