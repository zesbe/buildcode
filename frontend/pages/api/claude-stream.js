import { Readable } from 'stream';

// Available models - hanya Claude 4
const AVAILABLE_MODELS = {
  'claude-opus-4-20250514': 'claude-opus-4-20250514',
  'claude-sonnet-4-20250514': 'claude-sonnet-4-20250514'
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY belum dikonfigurasi' });
  }

  try {
    const { messages, model = 'claude-sonnet-4-20250514' } = req.body;
    
    // Validate model
    if (!AVAILABLE_MODELS[model]) {
      return res.status(400).json({ 
        error: `Model ${model} tidak didukung. Gunakan: claude-opus-4-20250514 atau claude-sonnet-4-20250514`
      });
    }

    // Set headers for SSE (Server-Sent Events)
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 4096,
        messages,
        stream: true,
        system: "You are Claude, an advanced AI assistant created by Anthropic. Respond naturally and helpfully."
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      res.write(`data: ${JSON.stringify({ error: error.error?.message || 'API Error' })}\n\n`);
      res.end();
      return;
    }

    // Stream the response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              res.write('data: [DONE]\n\n');
            } else {
              try {
                const parsed = JSON.parse(data);
                if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                  res.write(`data: ${JSON.stringify({ text: parsed.delta.text })}\n\n`);
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
      res.end();
    }

  } catch (error) {
    console.error('Streaming API Error:', error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
}