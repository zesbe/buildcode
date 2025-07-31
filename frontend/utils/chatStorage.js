// Chat storage utilities for persistent chat history
export class ChatStorage {
  constructor() {
    this.storageKey = 'chat-ai-history';
    this.sessionsKey = 'chat-ai-sessions';
    this.currentSessionKey = 'current-chat-session';
  }

  // Get all chat sessions
  getAllSessions() {
    try {
      const sessions = localStorage.getItem(this.sessionsKey);
      return sessions ? JSON.parse(sessions) : {};
    } catch (error) {
      console.error('Error loading chat sessions:', error);
      return {};
    }
  }

  // Get current session ID
  getCurrentSessionId() {
    return localStorage.getItem(this.currentSessionKey) || this.createNewSession();
  }

  // Create new chat session
  createNewSession(title = null) {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const sessions = this.getAllSessions();
    
    sessions[sessionId] = {
      id: sessionId,
      title: title || `Chat ${Object.keys(sessions).length + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: []
    };
    
    localStorage.setItem(this.sessionsKey, JSON.stringify(sessions));
    localStorage.setItem(this.currentSessionKey, sessionId);
    
    return sessionId;
  }

  // Switch to a different session
  switchSession(sessionId) {
    const sessions = this.getAllSessions();
    if (sessions[sessionId]) {
      localStorage.setItem(this.currentSessionKey, sessionId);
      return sessions[sessionId].messages;
    }
    return [];
  }

  // Save chat messages to current session
  saveChatHistory(messages) {
    try {
      const sessionId = this.getCurrentSessionId();
      const sessions = this.getAllSessions();
      
      if (sessions[sessionId]) {
        sessions[sessionId].messages = messages;
        sessions[sessionId].updatedAt = new Date().toISOString();
        
        // Auto-generate title from first user message
        if (!sessions[sessionId].title.startsWith('Chat') && messages.length > 0) {
          const firstUserMessage = messages.find(m => m.role === 'user');
          if (firstUserMessage) {
            sessions[sessionId].title = this.generateTitle(firstUserMessage.content);
          }
        }
        
        localStorage.setItem(this.sessionsKey, JSON.stringify(sessions));
      }
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  }

  // Load chat messages from current session
  loadChatHistory() {
    try {
      const sessionId = this.getCurrentSessionId();
      const sessions = this.getAllSessions();
      return sessions[sessionId]?.messages || [];
    } catch (error) {
      console.error('Error loading chat history:', error);
      return [];
    }
  }

  // Delete a chat session
  deleteSession(sessionId) {
    try {
      const sessions = this.getAllSessions();
      delete sessions[sessionId];
      localStorage.setItem(this.sessionsKey, JSON.stringify(sessions));
      
      // If we deleted the current session, create a new one
      if (this.getCurrentSessionId() === sessionId) {
        this.createNewSession();
      }
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  }

  // Update session title
  updateSessionTitle(sessionId, title) {
    try {
      const sessions = this.getAllSessions();
      if (sessions[sessionId]) {
        sessions[sessionId].title = title;
        sessions[sessionId].updatedAt = new Date().toISOString();
        localStorage.setItem(this.sessionsKey, JSON.stringify(sessions));
      }
    } catch (error) {
      console.error('Error updating session title:', error);
    }
  }

  // Generate title from message content
  generateTitle(content) {
    const words = content.trim().split(' ').slice(0, 6);
    let title = words.join(' ');
    if (words.length === 6 && content.split(' ').length > 6) {
      title += '...';
    }
    return title || 'New Chat';
  }

  // Export all chat data
  exportAllChats() {
    try {
      const sessions = this.getAllSessions();
      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        sessions: sessions
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `chat-history-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting chats:', error);
    }
  }

  // Import chat data
  importChats(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importData = JSON.parse(e.target.result);
          const currentSessions = this.getAllSessions();
          
          // Merge imported sessions with existing ones
          const mergedSessions = { ...currentSessions, ...importData.sessions };
          localStorage.setItem(this.sessionsKey, JSON.stringify(mergedSessions));
          
          resolve(Object.keys(importData.sessions).length);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  // Clear all chat data
  clearAllData() {
    try {
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem(this.sessionsKey);
      localStorage.removeItem(this.currentSessionKey);
      this.createNewSession();
    } catch (error) {
      console.error('Error clearing chat data:', error);
    }
  }

  // Get storage usage info
  getStorageInfo() {
    try {
      const sessions = this.getAllSessions();
      const sessionsCount = Object.keys(sessions).length;
      const totalMessages = Object.values(sessions).reduce((sum, session) => sum + session.messages.length, 0);
      
      // Estimate storage size
      const dataSize = JSON.stringify(sessions).length;
      const sizeInKB = Math.round(dataSize / 1024);
      
      return {
        sessionsCount,
        totalMessages,
        sizeInKB,
        maxStorageKB: 5120 // 5MB typical localStorage limit
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return { sessionsCount: 0, totalMessages: 0, sizeInKB: 0, maxStorageKB: 5120 };
    }
  }
}

// Create singleton instance
export const chatStorage = new ChatStorage();