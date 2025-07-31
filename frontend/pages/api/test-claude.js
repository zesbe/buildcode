import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
  }

  // HANYA CLAUDE 4 MODELS - SUDAH DIHAPUS SEMUA CLAUDE 3
  const modelsToTest = [
    'claude-opus-4-20250514',
    'claude-sonnet-4-20250514'
  ];

  const results = {};

  for (const model of modelsToTest) {
    try {
      console.log(`Testing Claude 4 model: ${model}`);
      
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: model,
          max_tokens: 20,
          messages: [{ role: 'user', content: 'Test Claude 4 availability' }]
        },
        {
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json'
          },
          timeout: 10000 // 10 second timeout
        }
      );
      
      results[model] = {
        available: true,
        status: 'OK',
        actualModel: response.data.model,
        response: response.data.content?.[0]?.text || 'Success'
      };
    } catch (error) {
      results[model] = {
        available: false,
        status: error.response?.status || 'ERROR',
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  res.status(200).json({
    message: '🎯 CLAUDE 4 ONLY - NO CLAUDE 3 MODELS',
    note: 'Semua model Claude 4 sudah dihapus dari sistem',
    timestamp: new Date().toISOString(),
    onlyModels: modelsToTest,
    results: results,
    summary: {
      total: modelsToTest.length,
      available: Object.values(results).filter(r => r.available).length,
      unavailable: Object.values(results).filter(r => !r.available).length
    }
  });
}
