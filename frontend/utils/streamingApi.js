// Streaming API utility for Claude chat integration
export class StreamingChatAPI {
  constructor(baseUrl = '') {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  }

  async streamChat(messages, model = 'claude-4-sonnet', onChunk, onError) {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages, model }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('event:')) {
            const eventType = line.slice(6).trim();
            continue;
          }

          if (line.startsWith('data:')) {
            try {
              const data = JSON.parse(line.slice(5));
              
              if (data.type === 'content_block_delta' && data.delta?.text) {
                onChunk(data.delta.text);
              } else if (data.type === 'error') {
                onError(new Error(data.error || 'Unknown error'));
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      onError(error);
    }
  }

  async getModels() {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat/models`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching models:', error);
      return { models: [] };
    }
  }
}