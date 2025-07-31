# Claude Codespace Backend

Backend API server for Claude Codespace with streaming chat support, GitHub integration, and Railway deployment.

## Features

- 🚀 **Streaming Chat API** - Real-time streaming responses from Claude 4 Opus and Sonnet
- 🔐 **GitHub Integration** - Full repository management capabilities
- 🛡️ **Security** - Rate limiting, CORS, and helmet protection
- 📊 **Health Checks** - Built-in health and readiness endpoints
- 🚄 **Railway Ready** - Optimized for Railway deployment

## Prerequisites

- Node.js 18+
- Anthropic API Key
- GitHub Personal Access Token (for GitHub features)
- Railway account (for deployment)

## Local Development

1. **Clone and navigate to backend:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your keys:
   ```
   ANTHROPIC_API_KEY=your_anthropic_api_key
   GITHUB_TOKEN=your_github_token
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

## API Endpoints

### Chat API

- `POST /api/chat/stream` - Streaming chat with Claude
- `POST /api/chat` - Regular chat (non-streaming)
- `GET /api/chat/models` - List available models

### GitHub API

- `GET /api/github/user` - Get authenticated user
- `GET /api/github/repos` - List repositories
- `POST /api/github/repos` - Create repository
- `GET /api/github/repos/:owner/:repo` - Get repository details
- `PUT /api/github/repos/:owner/:repo/contents/:path` - Create/update file
- `GET /api/github/repos/:owner/:repo/contents/:path` - Get file content
- `GET /api/github/repos/:owner/:repo/branches` - List branches
- `POST /api/github/repos/:owner/:repo/branches` - Create branch
- `POST /api/github/repos/:owner/:repo/pulls` - Create pull request

### Health API

- `GET /api/health` - Basic health check
- `GET /api/health/ready` - Readiness check

## Railway Deployment

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway:**
   ```bash
   railway login
   ```

3. **Create new project:**
   ```bash
   railway init
   ```

4. **Set environment variables:**
   ```bash
   railway variables set ANTHROPIC_API_KEY=your_key
   railway variables set GITHUB_TOKEN=your_token
   railway variables set NODE_ENV=production
   ```

5. **Deploy:**
   ```bash
   railway up
   ```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 3001) | No |
| `NODE_ENV` | Environment (development/production) | No |
| `ANTHROPIC_API_KEY` | Anthropic API key | Yes |
| `GITHUB_TOKEN` | GitHub personal access token | Yes |
| `FRONTEND_URL` | Frontend URL for CORS | No |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in ms | No |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | No |

## Streaming Response Format

The streaming endpoint returns Server-Sent Events (SSE) with the following event types:

- `message_start` - Initial message metadata
- `content_block_start` - Start of content block
- `content_block_delta` - Incremental content updates
- `content_block_stop` - End of content block
- `message_delta` - Message metadata updates
- `message_stop` - End of message
- `ping` - Keep-alive ping
- `error` - Error event

## Error Handling

All errors return JSON in the format:
```json
{
  "error": {
    "message": "Error description",
    "status": 500
  }
}
```

## Security

- **Rate Limiting**: Configurable per-IP rate limiting
- **CORS**: Configured for frontend integration
- **Helmet**: Security headers enabled
- **Input Validation**: Request validation on all endpoints

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request