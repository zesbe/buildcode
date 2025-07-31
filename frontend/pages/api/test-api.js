export default function handler(req, res) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  res.status(200).json({
    method: req.method,
    hasApiKey: !!apiKey,
    apiKeyLength: apiKey ? apiKey.length : 0,
    apiKeyPrefix: apiKey ? apiKey.substring(0, 10) + "..." : "NOT SET",
    nodeVersion: process.version,
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
}
