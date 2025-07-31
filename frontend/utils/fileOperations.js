// Utility untuk operasi file yang lebih advanced
export function validateFileName(name) {
  const validExtensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.md', '.css', '.html', '.json', '.txt', '.scss', '.sass', '.vue', '.php', '.rb', '.go', '.rs', '.cpp', '.c', '.java'];
  const hasValidExtension = validExtensions.some(ext => name.endsWith(ext));
  const isValidName = /^[a-zA-Z0-9._/-]+$/.test(name); // Allow folder paths

  // Smart auto-extension based on context
  const autoDetectExtension = (filename) => {
    const lower = filename.toLowerCase();
    if (lower.includes('component') || lower.includes('button') || lower.includes('header')) return '.tsx';
    if (lower.includes('hook') || lower.includes('use')) return '.ts';
    if (lower.includes('style') || lower.includes('css')) return '.css';
    if (lower.includes('test') || lower.includes('spec')) return '.test.js';
    if (lower.includes('config')) return '.json';
    if (lower.includes('readme') || lower.includes('doc')) return '.md';
    return '.tsx'; // Default untuk React project
  };

  // If no extension, suggest smart extension
  if (!hasValidExtension && isValidName) {
    const smartExtension = autoDetectExtension(name);
    return {
      isValid: true, // Allow creation with auto-extension
      hasValidExtension: false,
      isValidName: true,
      autoExtension: smartExtension,
      suggestions: [name + smartExtension, ...validExtensions.slice(0, 4).map(ext => name + ext)]
    };
  }

  return {
    isValid: hasValidExtension && isValidName,
    hasValidExtension,
    isValidName,
    suggestions: hasValidExtension ? [] : validExtensions.slice(0, 4).map(ext => name + ext)
  };
}

export function getFileIcon(filename) {
  if (filename.endsWith('.js') || filename.endsWith('.jsx')) return '🟨';
  if (filename.endsWith('.ts') || filename.endsWith('.tsx')) return '🔷';
  if (filename.endsWith('.py')) return '🐍';
  if (filename.endsWith('.md')) return '📝';
  if (filename.endsWith('.css')) return '🎨';
  if (filename.endsWith('.html')) return '🌐';
  if (filename.endsWith('.json')) return '⚙️';
  return '📄';
}

export function analyzeCodeStructure(content, language) {
  const analysis = {
    lines: content.split('\n').length,
    chars: content.length,
    functions: 0,
    imports: 0,
    exports: 0,
    todos: 0
  };
  
  if (language === 'javascript' || language === 'typescript') {
    analysis.functions = (content.match(/function\s+\w+|const\s+\w+\s*=\s*\(|=>\s*{/g) || []).length;
    analysis.imports = (content.match(/import\s+/g) || []).length;
    analysis.exports = (content.match(/export\s+/g) || []).length;
  }
  
  if (language === 'python') {
    analysis.functions = (content.match(/def\s+\w+/g) || []).length;
    analysis.imports = (content.match(/import\s+|from\s+\w+\s+import/g) || []).length;
  }
  
  analysis.todos = (content.match(/TODO|FIXME|NOTE/gi) || []).length;
  
  return analysis;
}

export function generateTemplate(type, name) {
  const templates = {
    'react-component': `import React from 'react';

export default function ${name}() {
  return (
    <div>
      <h1>${name} Component</h1>
    </div>
  );
}`,
    
    'react-hook': `import { useState, useEffect } from 'react';

export function use${name}() {
  const [value, setValue] = useState(null);
  
  useEffect(() => {
    // Effect logic here
  }, []);
  
  return { value, setValue };
}`,
    
    'express-route': `const express = require('express');
const router = express.Router();

router.get('/${name.toLowerCase()}', (req, res) => {
  res.json({ message: 'Hello from ${name}' });
});

module.exports = router;`,
    
    'python-class': `class ${name}:
    def __init__(self):
        pass
    
    def method(self):
        pass`,
    
    'css-component': `.${name.toLowerCase()} {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.${name.toLowerCase()}__title {
  font-size: 1.5rem;
  font-weight: bold;
}`
  };
  
  return templates[type] || '';
}

// Auto-save functionality
export class AutoSaver {
  constructor(saveCallback, delay = 2000) {
    this.saveCallback = saveCallback;
    this.delay = delay;
    this.timeoutId = null;
    this.lastSaved = Date.now();
  }
  
  schedule(data) {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    
    this.timeoutId = setTimeout(() => {
      this.saveCallback(data);
      this.lastSaved = Date.now();
    }, this.delay);
  }
  
  forceSave(data) {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.saveCallback(data);
    this.lastSaved = Date.now();
  }
  
  getTimeSinceLastSave() {
    return Date.now() - this.lastSaved;
  }
}
