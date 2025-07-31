// Advanced auto-save system with conflict resolution and version control
import { debounce } from 'lodash';

export class AdvancedAutoSave {
  constructor() {
    this.saveQueue = new Map();
    this.saveHistory = new Map();
    this.conflicts = new Map();
    this.saveVersion = 0;
    this.lastSaveTime = Date.now();
    
    // Debounced save function
    this.debouncedSave = debounce(this.processSaveQueue.bind(this), 1000);
    
    // Auto-save interval (only in browser)
    if (typeof window !== 'undefined') {
      this.autoSaveInterval = setInterval(() => {
        this.processSaveQueue();
      }, 30000); // Every 30 seconds
    }
  }

  // Queue file for saving with version control
  queueSave(filename, content, timestamp = Date.now()) {
    const currentEntry = this.saveQueue.get(filename);
    
    // Check for conflicts
    if (currentEntry && currentEntry.timestamp > timestamp) {
      this.conflicts.set(filename, {
        local: content,
        remote: currentEntry.content,
        localTimestamp: timestamp,
        remoteTimestamp: currentEntry.timestamp
      });
      return { conflict: true, filename };
    }
    
    this.saveQueue.set(filename, {
      content,
      timestamp,
      version: ++this.saveVersion,
      retryCount: 0
    });
    
    // Trigger debounced save
    this.debouncedSave();
    
    return { queued: true, version: this.saveVersion };
  }

  // Process the save queue
  async processSaveQueue() {
    if (this.saveQueue.size === 0) return;
    
    const filesToSave = Array.from(this.saveQueue.entries());
    const results = [];
    
    for (const [filename, data] of filesToSave) {
      try {
        const result = await this.saveFile(filename, data);
        if (result.success) {
          // Add to history
          this.addToHistory(filename, data);
          this.saveQueue.delete(filename);
        } else {
          // Retry logic
          data.retryCount++;
          if (data.retryCount >= 3) {
            this.saveQueue.delete(filename);
            results.push({ filename, error: 'Max retries exceeded', failed: true });
          }
        }
        results.push({ filename, ...result });
      } catch (error) {
        results.push({ filename, error: error.message, failed: true });
      }
    }
    
    this.lastSaveTime = Date.now();
    return results;
  }

  // Save individual file
  async saveFile(filename, data) {
    try {
      // Simulate save operation (in real app, this would save to server/local storage)
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return {
        success: true,
        timestamp: Date.now(),
        version: data.version,
        size: data.content.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Add to save history for version control
  addToHistory(filename, data) {
    if (!this.saveHistory.has(filename)) {
      this.saveHistory.set(filename, []);
    }
    
    const history = this.saveHistory.get(filename);
    history.push({
      content: data.content,
      timestamp: data.timestamp,
      version: data.version,
      size: data.content.length
    });
    
    // Keep only last 10 versions
    if (history.length > 10) {
      history.shift();
    }
  }

  // Get file history
  getFileHistory(filename) {
    return this.saveHistory.get(filename) || [];
  }

  // Resolve conflict
  resolveConflict(filename, resolution) {
    const conflict = this.conflicts.get(filename);
    if (!conflict) return null;
    
    let resolvedContent;
    switch (resolution) {
      case 'local':
        resolvedContent = conflict.local;
        break;
      case 'remote':
        resolvedContent = conflict.remote;
        break;
      case 'merge':
        resolvedContent = this.mergeContent(conflict.local, conflict.remote);
        break;
      default:
        return null;
    }
    
    this.conflicts.delete(filename);
    return this.queueSave(filename, resolvedContent);
  }

  // Simple content merge (can be enhanced with diff algorithms)
  mergeContent(local, remote) {
    // Simple line-based merge
    const localLines = local.split('\n');
    const remoteLines = remote.split('\n');
    const merged = [];
    
    const maxLines = Math.max(localLines.length, remoteLines.length);
    
    for (let i = 0; i < maxLines; i++) {
      const localLine = localLines[i] || '';
      const remoteLine = remoteLines[i] || '';
      
      if (localLine === remoteLine) {
        merged.push(localLine);
      } else if (localLine && remoteLine) {
        // Conflict marker
        merged.push(`<<<<<<< LOCAL`);
        merged.push(localLine);
        merged.push(`=======`);
        merged.push(remoteLine);
        merged.push(`>>>>>>> REMOTE`);
      } else {
        merged.push(localLine || remoteLine);
      }
    }
    
    return merged.join('\n');
  }

  // Get pending saves count
  getPendingSaves() {
    return this.saveQueue.size;
  }

  // Get conflicts count
  getConflictsCount() {
    return this.conflicts.size;
  }

  // Get save statistics
  getStats() {
    return {
      pendingSaves: this.saveQueue.size,
      conflicts: this.conflicts.size,
      totalVersions: this.saveVersion,
      lastSaveTime: this.lastSaveTime,
      historySize: Array.from(this.saveHistory.values()).reduce((sum, history) => sum + history.length, 0)
    };
  }

  // Force save all pending
  async forceSaveAll() {
    return await this.processSaveQueue();
  }

  // Clear save queue
  clearQueue() {
    this.saveQueue.clear();
  }

  // Cleanup
  destroy() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
    this.debouncedSave.cancel();
    this.saveQueue.clear();
    this.conflicts.clear();
  }
}

// Auto-formatting utilities
export class AutoFormatter {
  constructor() {
    this.formatters = {
      javascript: this.formatJavaScript.bind(this),
      typescript: this.formatTypeScript.bind(this),
      json: this.formatJSON.bind(this),
      css: this.formatCSS.bind(this),
      html: this.formatHTML.bind(this),
      markdown: this.formatMarkdown.bind(this)
    };
  }

  // Auto-format based on file extension
  format(filename, content) {
    const extension = filename.split('.').pop().toLowerCase();
    const language = this.getLanguageFromExtension(extension);
    
    if (this.formatters[language]) {
      return this.formatters[language](content);
    }
    
    return content;
  }

  getLanguageFromExtension(ext) {
    const mapping = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'json': 'json',
      'css': 'css',
      'scss': 'css',
      'sass': 'css',
      'html': 'html',
      'md': 'markdown'
    };
    return mapping[ext] || 'text';
  }

  formatJavaScript(content) {
    try {
      // Basic JavaScript formatting
      return content
        .replace(/;\s*\n\s*/g, ';\n')
        .replace(/{\s*\n\s*/g, '{\n  ')
        .replace(/}\s*\n\s*/g, '}\n')
        .replace(/,\s*\n\s*/g, ',\n  ')
        .replace(/\/\*\s*/g, '/* ')
        .replace(/\s*\*\//g, ' */')
        .replace(/\/\/\s*/g, '// ');
    } catch (error) {
      return content;
    }
  }

  formatTypeScript(content) {
    // TypeScript formatting (similar to JavaScript with types)
    return this.formatJavaScript(content)
      .replace(/:\s*([a-zA-Z]+)/g, ': $1')
      .replace(/interface\s+/g, 'interface ')
      .replace(/type\s+/g, 'type ');
  }

  formatJSON(content) {
    try {
      const parsed = JSON.parse(content);
      return JSON.stringify(parsed, null, 2);
    } catch (error) {
      return content;
    }
  }

  formatCSS(content) {
    return content
      .replace(/{\s*/g, ' {\n  ')
      .replace(/;\s*/g, ';\n  ')
      .replace(/}\s*/g, '\n}\n')
      .replace(/,\s*/g, ',\n');
  }

  formatHTML(content) {
    // Basic HTML formatting
    return content
      .replace(/></g, '>\n<')
      .replace(/^\s*\n/gm, '')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');
  }

  formatMarkdown(content) {
    return content
      .replace(/^#\s*/gm, '# ')
      .replace(/^##\s*/gm, '## ')
      .replace(/^###\s*/gm, '### ')
      .replace(/\*\*([^*]+)\*\*/g, '**$1**')
      .replace(/\*([^*]+)\*/g, '*$1*')
      .replace(/`([^`]+)`/g, '`$1`');
  }
}

// Auto-completion system
export class AutoComplete {
  constructor() {
    this.completions = new Map();
    this.loadDefaultCompletions();
  }

  loadDefaultCompletions() {
    // JavaScript/TypeScript completions
    this.completions.set('javascript', [
      { label: 'function', insertText: 'function ${1:name}(${2:params}) {\n  ${3}\n}', kind: 'function' },
      { label: 'const', insertText: 'const ${1:name} = ${2:value};', kind: 'keyword' },
      { label: 'let', insertText: 'let ${1:name} = ${2:value};', kind: 'keyword' },
      { label: 'if', insertText: 'if (${1:condition}) {\n  ${2}\n}', kind: 'keyword' },
      { label: 'for', insertText: 'for (let ${1:i} = 0; ${1:i} < ${2:length}; ${1:i}++) {\n  ${3}\n}', kind: 'keyword' },
      { label: 'while', insertText: 'while (${1:condition}) {\n  ${2}\n}', kind: 'keyword' },
      { label: 'try', insertText: 'try {\n  ${1}\n} catch (${2:error}) {\n  ${3}\n}', kind: 'keyword' },
      { label: 'class', insertText: 'class ${1:Name} {\n  constructor(${2:params}) {\n    ${3}\n  }\n}', kind: 'class' },
      { label: 'import', insertText: 'import ${1:name} from \'${2:module}\';', kind: 'keyword' },
      { label: 'export', insertText: 'export ${1:default} ${2:name};', kind: 'keyword' }
    ]);

    // React completions
    this.completions.set('react', [
      { label: 'useState', insertText: 'const [${1:state}, set${1/(.*)/${1:/capitalize}/}] = useState(${2:initialValue});', kind: 'function' },
      { label: 'useEffect', insertText: 'useEffect(() => {\n  ${1}\n}, [${2:dependencies}]);', kind: 'function' },
      { label: 'component', insertText: 'function ${1:ComponentName}(${2:props}) {\n  return (\n    <div>\n      ${3}\n    </div>\n  );\n}', kind: 'function' },
      { label: 'useCallback', insertText: 'const ${1:callback} = useCallback(() => {\n  ${2}\n}, [${3:dependencies}]);', kind: 'function' },
      { label: 'useMemo', insertText: 'const ${1:memoized} = useMemo(() => {\n  return ${2:value};\n}, [${3:dependencies}]);', kind: 'function' }
    ]);

    // CSS completions
    this.completions.set('css', [
      { label: 'flexbox', insertText: 'display: flex;\njustify-content: ${1:center};\nalign-items: ${2:center};', kind: 'property' },
      { label: 'grid', insertText: 'display: grid;\ngrid-template-columns: ${1:repeat(auto-fit, minmax(250px, 1fr))};\ngap: ${2:1rem};', kind: 'property' },
      { label: 'animation', insertText: 'animation: ${1:name} ${2:duration} ${3:ease} ${4:infinite};', kind: 'property' },
      { label: 'transition', insertText: 'transition: ${1:all} ${2:0.3s} ${3:ease};', kind: 'property' }
    ]);
  }

  getCompletions(language, prefix = '') {
    const langCompletions = this.completions.get(language) || [];
    const jsCompletions = this.completions.get('javascript') || [];
    
    // Combine language-specific and general completions
    const allCompletions = [...langCompletions, ...jsCompletions];
    
    if (!prefix) return allCompletions;
    
    return allCompletions.filter(completion => 
      completion.label.toLowerCase().startsWith(prefix.toLowerCase())
    );
  }

  addCompletion(language, completion) {
    if (!this.completions.has(language)) {
      this.completions.set(language, []);
    }
    this.completions.get(language).push(completion);
  }
}

// Export instances
export const advancedAutoSave = new AdvancedAutoSave();
export const autoFormatter = new AutoFormatter();
export const autoComplete = new AutoComplete();