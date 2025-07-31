// TypeScript types untuk OpenAI Claude API
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OpenAIResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ClaudeModels {
  'claude-opus-4-20250514': string;
  'claude-opus-4-0': string;
  'claude-sonnet-4-20250514': string;
  'claude-sonnet-4-0': string;
}

export type ClaudeModelType = keyof ClaudeModels;

export interface AICommand {
  type: 'create' | 'edit' | 'replace' | 'delete' | 'rename';
  filename?: string;
  oldName?: string;
  newName?: string;
  content?: string;
  language?: string;
  oldText?: string;
  newText?: string;
  isExplicit: boolean;
  confidence?: 'high' | 'medium' | 'low';
}

export interface FileMetadata {
  lastModified: number;
  isAutoCreated: boolean;
  modifiedBy: 'manual' | 'auto';
  language?: string;
}

export interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}
