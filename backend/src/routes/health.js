import { Router } from 'express';

const router = Router();

// Health check endpoint
router.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Readiness check
router.get('/ready', async (req, res) => {
  try {
    // Check if required environment variables are set
    const checks = {
      anthropicApiKey: !!process.env.ANTHROPIC_API_KEY,
      githubToken: !!process.env.GITHUB_TOKEN,
      port: !!process.env.PORT
    };

    const isReady = Object.values(checks).every(check => check === true);

    res.status(isReady ? 200 : 503).json({
      ready: isReady,
      checks,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      ready: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;