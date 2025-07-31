import Anthropic from '@anthropic-ai/sdk';

class AnthropicService {
  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async createStreamingChat(messages, model = 'claude-3-5-sonnet-20241022', maxTokens = 4096) {
    try {
      // Map model names to correct API identifiers
      const modelMap = {
        'claude-4-opus': 'claude-3-5-sonnet-20241022', // Using latest available model
        'claude-4-sonnet': 'claude-3-5-sonnet-20241022',
        'claude-3.5-sonnet': 'claude-3-5-sonnet-20241022',
        'claude-3-opus': 'claude-3-opus-20240229',
        'claude-3-sonnet': 'claude-3-sonnet-20240229'
      };

      const selectedModel = modelMap[model] || model;

      const stream = await this.client.messages.create({
        model: selectedModel,
        messages: messages,
        max_tokens: maxTokens,
        stream: true,
      });

      return stream;
    } catch (error) {
      console.error('Anthropic API error:', error);
      throw error;
    }
  }

  async createChat(messages, model = 'claude-3-5-sonnet-20241022', maxTokens = 4096) {
    try {
      const modelMap = {
        'claude-4-opus': 'claude-3-5-sonnet-20241022',
        'claude-4-sonnet': 'claude-3-5-sonnet-20241022',
        'claude-3.5-sonnet': 'claude-3-5-sonnet-20241022',
        'claude-3-opus': 'claude-3-opus-20240229',
        'claude-3-sonnet': 'claude-3-sonnet-20240229'
      };

      const selectedModel = modelMap[model] || model;

      const response = await this.client.messages.create({
        model: selectedModel,
        messages: messages,
        max_tokens: maxTokens,
      });

      return response;
    } catch (error) {
      console.error('Anthropic API error:', error);
      throw error;
    }
  }

  // Helper method to format messages for the API
  formatMessages(messages) {
    return messages.map(msg => ({
      role: msg.role === 'system' ? 'assistant' : msg.role,
      content: msg.content
    }));
  }
}

export default new AnthropicService();