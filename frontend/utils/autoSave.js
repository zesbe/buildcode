// Auto-Save System dengan Cloud Sync dan Session Recovery
class AutoSaveManager {
  constructor() {
    this.saveInterval = null;
    this.saveQueue = new Map();
    this.isOnline = typeof window !== 'undefined' ? navigator.onLine : false;
    this.pendingSync = [];
    this.sessionId = this.generateSessionId();

    // Only initialize if in browser environment
    if (typeof window !== 'undefined') {
      this.initializeBrowser();
    }
  }

  initializeBrowser() {
    // Event listeners
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingChanges();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    window.addEventListener('beforeunload', () => {
      this.forceSave();
    });

    // Initialize auto-save
    this.startAutoSave();
  }
  
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  
  // Start auto-save with 2-second interval
  startAutoSave() {
    if (this.saveInterval) clearInterval(this.saveInterval);
    
    this.saveInterval = setInterval(() => {
      this.processQueue();
    }, 2000);
  }
  
  // Add file to save queue
  queueSave(filename, content) {
    this.saveQueue.set(filename, {
      content,
      timestamp: Date.now(),
      saved: false
    });
  }
  
  // Process save queue
  async processQueue() {
    if (this.saveQueue.size === 0) return;
    
    const unsavedFiles = Array.from(this.saveQueue.entries())
      .filter(([_, data]) => !data.saved);
    
    if (unsavedFiles.length === 0) return;
    
    try {
      // Save to localStorage first (instant)
      await this.saveToLocal(unsavedFiles);
      
      // Mark as saved locally
      unsavedFiles.forEach(([filename, _]) => {
        if (this.saveQueue.has(filename)) {
          this.saveQueue.get(filename).saved = true;
        }
      });
      
      // Sync to cloud if online
      if (this.isOnline) {
        await this.syncToCloud(unsavedFiles);
      } else {
        this.pendingSync.push(...unsavedFiles);
      }
      
    } catch (error) {
      console.error('Auto-save error:', error);
    }
  }
  
  // Save to localStorage
  async saveToLocal(files) {
    if (typeof window === 'undefined') return;

    const sessionData = this.getSessionData();

    files.forEach(([filename, data]) => {
      sessionData.files[filename] = {
        content: data.content,
        lastModified: data.timestamp,
        autoSaved: true
      };
    });

    sessionData.lastSaved = Date.now();
    localStorage.setItem('autoSave_session', JSON.stringify(sessionData));
    
    // Show auto-save indicator
    this.showAutoSaveIndicator();
  }
  
  // Get current session data
  getSessionData() {
    if (typeof window === 'undefined') {
      return {
        sessionId: this.sessionId,
        files: {},
        openTabs: [],
        selectedTab: null,
        folders: [],
        expandedFolders: [],
        lastSaved: Date.now(),
        version: '1.0'
      };
    }

    const existing = localStorage.getItem('autoSave_session');
    if (existing) {
      return JSON.parse(existing);
    }
    
    return {
      sessionId: this.sessionId,
      files: {},
      openTabs: [],
      selectedTab: null,
      folders: [],
      expandedFolders: [],
      lastSaved: Date.now(),
      version: '1.0'
    };
  }
  
  // Save complete session state
  saveSessionState(state) {
    if (typeof window === 'undefined') return;

    const sessionData = {
      sessionId: this.sessionId,
      files: state.files || {},
      openTabs: state.openTabs || [],
      selectedTab: state.selectedTab || null,
      folders: state.folders || [],
      expandedFolders: state.expandedFolders || [],
      activePanel: state.activePanel || 'files',
      chatMode: state.chatMode || 'chat',
      enhancedEditorEnabled: state.enhancedEditorEnabled || true,
      lastSaved: Date.now(),
      version: '1.0'
    };

    localStorage.setItem('autoSave_session', JSON.stringify(sessionData));
  }
  
  // Restore session state
  restoreSession() {
    if (typeof window === 'undefined') return null;

    try {
      const sessionData = localStorage.getItem('autoSave_session');
      if (!sessionData) return null;
      
      const data = JSON.parse(sessionData);
      
      // Check if session is recent (within 24 hours)
      const now = Date.now();
      const sessionAge = now - data.lastSaved;
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      if (sessionAge > maxAge) {
        localStorage.removeItem('autoSave_session');
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Session restore error:', error);
      return null;
    }
  }
  
  // Sync to cloud (simulated - bisa integrate dengan real cloud service)
  async syncToCloud(files) {
    // Simulate cloud sync delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In real implementation, this would sync to:
    // - GitHub Gists
    // - Google Drive
    // - Dropbox
    // - Custom backend
    
    console.log('Synced to cloud:', files.map(([filename, _]) => filename));
    return true;
  }
  
  // Sync pending changes when back online
  async syncPendingChanges() {
    if (this.pendingSync.length === 0) return;
    
    try {
      await this.syncToCloud(this.pendingSync);
      this.pendingSync = [];
      console.log('Pending changes synced to cloud');
    } catch (error) {
      console.error('Failed to sync pending changes:', error);
    }
  }
  
  // Force save (for beforeunload)
  forceSave() {
    if (typeof window === 'undefined') return;

    const unsavedFiles = Array.from(this.saveQueue.entries())
      .filter(([_, data]) => !data.saved);

    if (unsavedFiles.length > 0) {
      // Synchronous save to localStorage
      const sessionData = this.getSessionData();
      unsavedFiles.forEach(([filename, data]) => {
        sessionData.files[filename] = {
          content: data.content,
          lastModified: data.timestamp,
          autoSaved: true
        };
      });
      localStorage.setItem('autoSave_session', JSON.stringify(sessionData));
    }
  }
  
  // Show auto-save indicator
  showAutoSaveIndicator() {
    if (typeof document === 'undefined') return;

    // Create or update auto-save indicator
    let indicator = document.getElementById('autosave-indicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'autosave-indicator';
      indicator.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
        z-index: 9999;
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
      `;
      document.body.appendChild(indicator);
    }
    
    indicator.textContent = '💾 Auto-saved';
    indicator.style.opacity = '1';
    
    setTimeout(() => {
      indicator.style.opacity = '0';
    }, 2000);
  }
  
  // Clear session
  clearSession() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('autoSave_session');
    }
    this.saveQueue.clear();
    this.pendingSync = [];
  }
  
  // Get save status
  getSaveStatus() {
    const unsaved = Array.from(this.saveQueue.entries())
      .filter(([_, data]) => !data.saved);
    
    return {
      unsavedCount: unsaved.length,
      pendingSyncCount: this.pendingSync.length,
      isOnline: this.isOnline,
      lastSaved: this.getSessionData().lastSaved
    };
  }
}

// Export singleton instance
export const autoSaveManager = new AutoSaveManager();

// Export utility functions
export function useAutoSave(files, setFiles, setSelected, openTabs, setOpenTabs, folders, setFolders, expandedFolders, setExpandedFolders, activePanel, chatMode, enhancedEditorEnabled) {
  
  // Queue file changes for auto-save
  const queueFileChange = (filename, content) => {
    autoSaveManager.queueSave(filename, content);
  };
  
  // Save complete session state
  const saveSession = () => {
    autoSaveManager.saveSessionState({
      files,
      openTabs,
      selectedTab: null, // Will be set from component
      folders,
      expandedFolders,
      activePanel,
      chatMode,
      enhancedEditorEnabled
    });
  };
  
  // Restore session on app start
  const restoreSession = () => {
    const sessionData = autoSaveManager.restoreSession();
    if (!sessionData) return false;
    
    try {
      // Restore files
      if (sessionData.files && Object.keys(sessionData.files).length > 0) {
        const restoredFiles = {};
        Object.entries(sessionData.files).forEach(([filename, data]) => {
          restoredFiles[filename] = data.content;
        });
        setFiles(restoredFiles);
      }
      
      // Restore tabs
      if (sessionData.openTabs && sessionData.openTabs.length > 0) {
        setOpenTabs(sessionData.openTabs);
      }
      
      // Restore selected tab
      if (sessionData.selectedTab) {
        setSelected(sessionData.selectedTab);
      }
      
      // Restore folders
      if (sessionData.folders) {
        setFolders(sessionData.folders);
      }
      
      if (sessionData.expandedFolders) {
        setExpandedFolders(sessionData.expandedFolders);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to restore session:', error);
      return false;
    }
  };
  
  return {
    queueFileChange,
    saveSession,
    restoreSession,
    getSaveStatus: () => autoSaveManager.getSaveStatus(),
    clearSession: () => autoSaveManager.clearSession()
  };
}
