export async function chatClaudeStream({ messages, model = 'claude-sonnet-4-20250514', onChunk, onError, onComplete }) {
  // Validasi model - hanya terima Claude 4
  const allowedModels = ['claude-opus-4-20250514', 'claude-sonnet-4-20250514'];
  if (!allowedModels.includes(model)) {
    onError?.(new Error(`Model ${model} tidak didukung. Gunakan: ${allowedModels.join(' atau ')}`));
    return;
  }

  try {
    const response = await fetch('/api/claude-stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages, model }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      
      // Keep the last incomplete line in the buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          
          if (data === '[DONE]') {
            onComplete?.();
            return;
          }

          try {
            const parsed = JSON.parse(data);
            
            if (parsed.error) {
              onError?.(new Error(parsed.error));
              return;
            }
            
            if (parsed.text) {
              onChunk?.(parsed.text);
            }
          } catch (e) {
            // Skip invalid JSON
            console.error('Parse error:', e);
          }
        }
      }
    }

    onComplete?.();
  } catch (error) {
    console.error('Stream Error:', error);
    onError?.(error);
  }
}