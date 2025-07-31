import axios from 'axios';

// Available models - hanya Claude 4
const AVAILABLE_MODELS = {
  // Claude 4 models only
  'claude-opus-4-20250514': 'claude-opus-4-20250514',
  'claude-sonnet-4-20250514': 'claude-sonnet-4-20250514'
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY belum dikonfigurasi di environment variables' });
  }

  if (!apiKey || apiKey.trim() === '') {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY is empty' });
  }

  try {
    const { messages, model = 'claude-sonnet-4-20250514' } = req.body;
    
    // Validate model - hanya terima Claude 4
    if (!AVAILABLE_MODELS[model]) {
      return res.status(400).json({ 
        error: `Model ${model} tidak didukung. Gunakan: claude-opus-4-20250514 atau claude-sonnet-4-20250514`,
        availableModels: Object.keys(AVAILABLE_MODELS)
      });
    }

    console.log(`Requested model: ${model}`);
    console.log(`Using model: ${model}`);

    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: model,
        max_tokens: 4096,
        messages,
        system: "You are Claude, an advanced AI assistant created by Anthropic. Respond naturally and helpfully."
      },
      {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        }
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Claude API Error Details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      requestedModel: req.body?.model,
      url: error.config?.url
    });

    let errorMessage = 'Failed to connect to Claude API';

    if (error.response?.data?.error?.message) {
      errorMessage = error.response.data.error.message;
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.status === 400) {
      errorMessage = 'Invalid request to Claude API - periksa model yang digunakan';
    } else if (error.response?.status === 401) {
      errorMessage = 'API key invalid atau expired';
    } else if (error.response?.status === 403) {
      errorMessage = 'Access denied - periksa permissions API key';
    } else if (error.response?.status === 404) {
      errorMessage = 'Claude model tidak ditemukan atau tidak tersedia';
    } else if (error.response?.status === 405) {
      errorMessage = 'Method not allowed - model mungkin tidak tersedia';
    } else if (error.response?.status >= 500) {
      errorMessage = 'Claude API server error';
    } else if (error.message) {
      errorMessage = error.message;
    }

    res.status(error.response?.status || 500).json({
      error: errorMessage,
      model: req.body?.model,
      status: error.response?.status || 500,
      details: error.response?.data,
      availableModels: Object.keys(AVAILABLE_MODELS)
    });
  }
}
