// Health check endpoint for Railway deployment
export default function handler(req, res) {
  // Simple health check
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'claude-codespace-frontend',
    version: '1.0.0'
  });
}