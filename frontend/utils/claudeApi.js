export async function chatClaude({ messages, model = 'claude-sonnet-4-20250514', retryCount = 0 }) {
  const maxRetries = 3;
  
  // Validasi model - hanya terima Claude 4
  const allowedModels = ['claude-opus-4-20250514', 'claude-sonnet-4-20250514'];
  if (!allowedModels.includes(model)) {
    throw new Error(`Model ${model} tidak didukung. Gunakan: ${allowedModels.join(' atau ')}`);
  }
  
  try {
    // Use Railway API routes for both production and development
    const apiUrl = '/api/claude';
      
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages, model }),
    });

    if (!response.ok) {
      let error;
      try {
        error = await response.json();
      } catch (parseError) {
        error = { error: `HTTP ${response.status}: ${response.statusText}` };
      }
      
      const errorMessage = error.error || error.message || 'Failed to connect to Claude';
      
      // Retry on server errors (5xx) or rate limits (429)
      if ((response.status >= 500 || response.status === 429) && retryCount < maxRetries) {
        console.log(`Retrying request (attempt ${retryCount + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000)); // Exponential backoff
        return chatClaude({ messages, model, retryCount: retryCount + 1 });
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // Validate response structure
    if (!data || !data.content || !Array.isArray(data.content)) {
      throw new Error('Invalid response format from Claude API');
    }

    return data;
  } catch (error) {
    console.error('Claude API Error:', error);
    
    // Network or fetch errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error - please check your connection');
    }
    
    // JSON parsing errors
    if (error.name === 'SyntaxError') {
      throw new Error('Server response error - please try again');
    }
    
    // Re-throw the error with context
    throw new Error(error.message || 'Unknown error occurred');
  }
}