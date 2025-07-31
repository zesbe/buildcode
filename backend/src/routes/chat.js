import { Router } from 'express';
import anthropicService from '../services/anthropicService.js';

const router = Router();

// Streaming chat endpoint
router.post('/stream', async (req, res) => {
  try {
    const { messages, model = 'claude-4-sonnet', maxTokens = 4096 } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Format messages
    const formattedMessages = anthropicService.formatMessages(messages);

    // Create streaming response
    const stream = await anthropicService.createStreamingChat(formattedMessages, model, maxTokens);

    // Handle stream events
    for await (const event of stream) {
      if (event.type === 'message_start') {
        res.write(`event: message_start\n`);
        res.write(`data: ${JSON.stringify(event)}\n\n`);
      } else if (event.type === 'content_block_start') {
        res.write(`event: content_block_start\n`);
        res.write(`data: ${JSON.stringify(event)}\n\n`);
      } else if (event.type === 'content_block_delta') {
        res.write(`event: content_block_delta\n`);
        res.write(`data: ${JSON.stringify(event)}\n\n`);
      } else if (event.type === 'content_block_stop') {
        res.write(`event: content_block_stop\n`);
        res.write(`data: ${JSON.stringify(event)}\n\n`);
      } else if (event.type === 'message_delta') {
        res.write(`event: message_delta\n`);
        res.write(`data: ${JSON.stringify(event)}\n\n`);
      } else if (event.type === 'message_stop') {
        res.write(`event: message_stop\n`);
        res.write(`data: ${JSON.stringify(event)}\n\n`);
        res.end();
      } else if (event.type === 'ping') {
        res.write(`event: ping\n`);
        res.write(`data: ${JSON.stringify(event)}\n\n`);
      }
    }
  } catch (error) {
    console.error('Streaming error:', error);
    res.write(`event: error\n`);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

// Regular chat endpoint (non-streaming)
router.post('/', async (req, res) => {
  try {
    const { messages, model = 'claude-4-sonnet', maxTokens = 4096 } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const formattedMessages = anthropicService.formatMessages(messages);
    const response = await anthropicService.createChat(formattedMessages, model, maxTokens);

    res.json(response);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get available models
router.get('/models', (req, res) => {
  res.json({
    models: [
      { id: 'claude-4-opus', name: 'Claude 4 Opus (Most Capable)', description: 'Best for complex tasks requiring deep reasoning' },
      { id: 'claude-4-sonnet', name: 'Claude 4 Sonnet (Balanced)', description: 'Great balance of speed and capability' },
      { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', description: 'Fast and efficient' },
      { id: 'claude-3-opus', name: 'Claude 3 Opus', description: 'Previous generation, most capable' },
      { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', description: 'Previous generation, balanced' }
    ]
  });
});

export default router;