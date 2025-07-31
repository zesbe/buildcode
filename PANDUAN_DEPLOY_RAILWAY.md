# 🚀 Panduan Deploy ke Railway - Chat AI Percobaan

## 📋 Ringkasan Proyek
Proyek ini adalah aplikasi Chat AI dengan arsitektur terpisah:
- **Backend**: Express.js API server (Port 3002) dengan integrasi Anthropic Claude
- **Frontend**: Next.js application (Port 3000) dengan Monaco Editor dan streaming chat

## 🔧 Prasyarat

### 1. Akun dan Tools
- Akun Railway di [railway.app](https://railway.app)
- Railway CLI (optional tapi direkomendasikan)
- Git repository yang sudah ter-push ke GitHub

### 2. Environment Variables yang Diperlukan
- `ANTHROPIC_API_KEY`: API key dari Anthropic Claude
- `GITHUB_TOKEN`: Token GitHub untuk integrasi (optional)
- `NODE_ENV`: production (otomatis di Railway)

## 🚂 Cara Deploy ke Railway

### Opsi 1: Deploy via Railway Dashboard (Recommended)

#### Step 1: Setup Backend
1. Login ke [Railway Dashboard](https://railway.app/dashboard)
2. Klik **"New Project"** → **"Deploy from GitHub repo"**
3. Pilih repository `zesbe/chat-ai-percobaan`
4. Railway akan otomatis detect struktur project

#### Step 2: Konfigurasi Backend Service
1. Railway akan membuat service otomatis
2. Klik service backend yang dibuat
3. Masuk ke tab **"Settings"**
4. Set **Root Directory** ke `/backend`
5. Di tab **"Variables"**, tambahkan:
   ```
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   NODE_ENV=production
   ```

#### Step 3: Konfigurasi Frontend Service
1. Tambah service baru: **"+ New"** → **"GitHub Repo"**
2. Pilih repository yang sama
3. Set **Root Directory** ke `/frontend`
4. Di tab **"Variables"**, tambahkan:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-service.railway.app
   NODE_ENV=production
   ```

### Opsi 2: Deploy via Railway CLI

#### Step 1: Install Railway CLI
```bash
# Windows (PowerShell)
iwr -useb https://railway.app/install.ps1 | iex

# macOS/Linux
curl -fsSL https://railway.app/install.sh | sh
```

#### Step 2: Login dan Link Project
```bash
railway login
railway link
```

#### Step 3: Deploy Backend
```bash
cd backend
railway up --service backend
```

#### Step 4: Deploy Frontend
```bash
cd ../frontend
railway up --service frontend
```

### Opsi 3: Deploy via Template (One-Click)

Railway template sudah tersedia di `railway-template.json`. Gunakan link ini:

```
https://railway.app/template/your-template-id
```

## ⚙️ Konfigurasi File Railway

### Backend Railway Config (`backend/railway.toml`)
```toml
[build]
builder = "NIXPACKS"
buildCommand = "npm ci --only=production"

[deploy]
startCommand = "npm start"
restartPolicyType = "ON_FAILURE" 
restartPolicyMaxRetries = 10
healthcheckPath = "/api/health"
healthcheckTimeout = 30

[[services]]
name = "claude-codespace-backend"
port = 3002

[environments.production]
NODE_ENV = "production"
```

### Frontend Railway Config (`frontend/railway.toml`)
```toml
[build]
builder = "NIXPACKS"
buildCommand = "npm install && npm run build"

[deploy]
startCommand = "npm start"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[[services]]
name = "frontend"
port = 3000

[environments.production]
NODE_ENV = "production"
```

## 🔗 Connecting Frontend ke Backend

### Automatic Service Connection
Railway otomatis menyediakan internal networking. Frontend dapat mengakses backend menggunakan:

```javascript
// Di environment variables frontend
NEXT_PUBLIC_API_URL=https://your-backend-service.railway.app
```

### Manual Configuration
Jika perlu configure manual:

1. Copy backend service URL dari Railway dashboard
2. Set di frontend environment variables
3. Update file konfigurasi jika diperlukan

## ✅ Verifikasi Deployment

### 1. Cek Health Endpoints
```bash
# Backend health check
curl https://your-backend-service.railway.app/api/health

# Expected response: {"status": "ok", "timestamp": "..."}
```

### 2. Test API Endpoints
```bash
# Test chat endpoint
curl -X POST https://your-backend-service.railway.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "conversationId": "test"}'
```

### 3. Frontend Access
Akses frontend di: `https://your-frontend-service.railway.app`

## 🛠️ Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Check logs
railway logs --service backend
railway logs --service frontend
```

#### 2. Environment Variables Missing
- Pastikan `ANTHROPIC_API_KEY` sudah diset
- Check di Railway Dashboard → Service → Variables

#### 3. CORS Issues
Backend sudah dikonfigurasi untuk menerima request dari frontend Railway domain.

#### 4. Port Configuration
- Backend: Port 3002 (configured di railway.toml)
- Frontend: Port 3000 (Next.js default)
- Railway automatically handles port mapping

### Debugging Commands
```bash
# Check deployment status
railway status

# View logs in real-time
railway logs --tail

# SSH into deployment (jika perlu)
railway shell
```

## 📊 Monitoring & Maintenance

### 1. Logs Monitoring
```bash
# Backend logs
railway logs --service backend --tail

# Frontend logs  
railway logs --service frontend --tail
```

### 2. Resource Usage
Check di Railway Dashboard → Service → Metrics

### 3. Health Monitoring
Backend memiliki health check endpoint di `/api/health` yang secara otomatis dimonitor Railway.

## 💰 Estimasi Biaya

### Railway Pricing (2024)
- **Hobby Plan**: $5/month per service
- **Pro Plan**: $20/month per service
- Resource usage billing setelah free tier

### Optimasi Biaya
- Gunakan single service dengan monorepo structure jika memungkinkan
- Monitor resource usage di dashboard
- Set up auto-sleep untuk development environments

## 🔄 CI/CD Integration

### Auto-deploy dari GitHub
Railway otomatis re-deploy ketika ada push ke main branch.

### Custom Deploy Hooks
```bash
# Tambah di package.json
"scripts": {
  "deploy:railway": "railway up --detach",
  "deploy:check": "npm run health"
}
```

## 🤝 Support

Jika mengalami masalah:
1. Check Railway logs first
2. Verify environment variables
3. Check [Railway documentation](https://docs.railway.app)
4. Contact Railway support via dashboard

---

## ⚡ Quick Start Summary

1. **Fork/Clone** repository
2. **Setup Railway** project dari GitHub repo
3. **Configure** environment variables:
   - Backend: `ANTHROPIC_API_KEY`
   - Frontend: `NEXT_PUBLIC_API_URL`
4. **Deploy** otomatis via Railway
5. **Test** endpoints dan frontend access

**Deployment URLs:**
- Backend API: `https://your-backend-service.railway.app`  
- Frontend App: `https://your-frontend-service.railway.app`

Selamat coding! 🎉