import { chatClaude } from './claudeApi';

export class AutomatedCodeAnalyzer {
  constructor() {
    this.cache = new Map();
    this.analysisQueue = [];
    this.isProcessing = false;
    this.autoFixEnabled = true;
    this.analysisDelay = 1000; // 1 second debounce
  }

  async analyzeCodeRealTime(filename, content, onChange) {
    if (!content || content.length < 10) return null;

    // Debounce analysis
    clearTimeout(this.debounceTimeout);
    this.debounceTimeout = setTimeout(async () => {
      const analysis = await this.performAIAnalysis(filename, content);
      
      if (this.autoFixEnabled && analysis.autoFixes && analysis.autoFixes.length > 0) {
        const fixedContent = await this.applyAutoFixes(content, analysis.autoFixes);
        if (fixedContent !== content) {
          onChange(fixedContent);
        }
      }
      
      return analysis;
    }, this.analysisDelay);
  }

  async performAIAnalysis(filename, content) {
    const cacheKey = `${filename}_${this.hashCode(content)}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const fileType = this.detectFileType(filename);
      const prompt = this.buildAnalysisPrompt(filename, content, fileType);
      
      const response = await chatClaude({
        messages: [{ role: "user", content: prompt }],
        model: "claude-sonnet-4-20250514"
      });

      const analysis = this.parseAnalysisResponse(response.content?.[0]?.text || '');
      
      // Cache the result
      this.cache.set(cacheKey, analysis);
      
      // Clean old cache entries
      if (this.cache.size > 100) {
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey);
      }
      
      return analysis;
    } catch (error) {
      console.error('Analysis error:', error);
      return {
        errors: [],
        warnings: [],
        suggestions: [],
        autoFixes: [],
        quality: { score: 50, issues: ['Analysis failed'] }
      };
    }
  }

  buildAnalysisPrompt(filename, content, fileType) {
    return `Analyze this ${fileType} code for issues and improvements:

File: ${filename}
Content:
\`\`\`${fileType}
${content}
\`\`\`

Please provide a JSON response with:
{
  "errors": [{"line": number, "message": "error description", "severity": "error"}],
  "warnings": [{"line": number, "message": "warning description", "severity": "warning"}],
  "suggestions": [{"line": number, "message": "suggestion", "severity": "info"}],
  "autoFixes": [{"line": number, "original": "code", "fixed": "fixed code", "description": "fix description"}],
  "quality": {"score": 0-100, "issues": ["list of quality issues"]},
  "performance": ["performance improvement suggestions"],
  "security": ["security recommendations"]
}

Focus on:
- TypeScript errors and type issues
- React best practices
- Performance optimizations  
- Security vulnerabilities
- Code style and readability
- Missing error handling
- Unused variables/imports`;
  }

  parseAnalysisResponse(response) {
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback parsing
      return this.fallbackParseResponse(response);
    } catch (error) {
      return this.fallbackParseResponse(response);
    }
  }

  fallbackParseResponse(response) {
    const analysis = {
      errors: [],
      warnings: [],
      suggestions: [],
      autoFixes: [],
      quality: { score: 75, issues: [] },
      performance: [],
      security: []
    };

    // Simple pattern matching for common issues
    const lines = response.split('\n');
    
    lines.forEach((line, index) => {
      if (line.includes('error') || line.includes('Error')) {
        analysis.errors.push({
          line: index + 1,
          message: line.trim(),
          severity: 'error'
        });
      } else if (line.includes('warning') || line.includes('Warning')) {
        analysis.warnings.push({
          line: index + 1,
          message: line.trim(),
          severity: 'warning'
        });
      } else if (line.includes('suggest') || line.includes('recommend')) {
        analysis.suggestions.push({
          line: index + 1,
          message: line.trim(),
          severity: 'info'
        });
      }
    });

    return analysis;
  }

  async applyAutoFixes(content, autoFixes) {
    let fixedContent = content;
    
    // Sort fixes by line number (descending) to avoid line number shifts
    const sortedFixes = autoFixes.sort((a, b) => b.line - a.line);
    
    for (const fix of sortedFixes) {
      if (fix.original && fix.fixed) {
        fixedContent = fixedContent.replace(fix.original, fix.fixed);
      }
    }
    
    return fixedContent;
  }

  async getAutoCompletions(filename, content, position) {
    try {
      const context = this.extractContext(content, position);
      const fileType = this.detectFileType(filename);
      
      const prompt = `Provide auto-completion suggestions for this ${fileType} code:

Context:
\`\`\`${fileType}
${context}
\`\`\`

Cursor position: ${position}

Provide 5-10 relevant completions as JSON array:
[{"label": "completion", "detail": "description", "insertText": "code to insert"}]`;

      const response = await chatClaude({
        messages: [{ role: "user", content: prompt }],
        model: "claude-sonnet-4-20250514"
      });

      const jsonMatch = response.content?.[0]?.text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return [];
    } catch (error) {
      console.error('Auto-completion error:', error);
      return [];
    }
  }

  async getHoverInfo(filename, content, position) {
    try {
      const context = this.extractContext(content, position);
      const fileType = this.detectFileType(filename);
      
      const prompt = `Provide hover information for this ${fileType} code:

Context:
\`\`\`${fileType}
${context}
\`\`\`

Position: ${position}

Provide helpful information about the symbol at the cursor position including:
- Type information
- Documentation
- Usage examples
- Related symbols`;

      const response = await chatClaude({
        messages: [{ role: "user", content: prompt }],
        model: "claude-sonnet-4-20250514"
      });

      return {
        contents: [{ value: response.content?.[0]?.text || 'No information available' }]
      };
    } catch (error) {
      console.error('Hover info error:', error);
      return {
        contents: [{ value: 'Information not available' }]
      };
    }
  }

  extractContext(content, position) {
    const lines = content.split('\n');
    const currentLine = Math.floor(position / 80); // Rough estimate
    const startLine = Math.max(0, currentLine - 5);
    const endLine = Math.min(lines.length, currentLine + 5);
    
    return lines.slice(startLine, endLine).join('\n');
  }

  detectFileType(filename) {
    const ext = filename.split('.').pop()?.toLowerCase();
    
    const typeMap = {
      'ts': 'typescript',
      'tsx': 'typescript',
      'js': 'javascript', 
      'jsx': 'javascript',
      'css': 'css',
      'scss': 'scss',
      'html': 'html',
      'json': 'json',
      'md': 'markdown',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c'
    };
    
    return typeMap[ext] || 'text';
  }

  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  }

  // Performance monitoring
  startPerformanceMonitoring(callback) {
    this.performanceCallback = callback;
    this.startTime = performance.now();
    
    // Monitor every 5 seconds
    this.performanceInterval = setInterval(() => {
      const metrics = this.getPerformanceMetrics();
      if (this.performanceCallback) {
        this.performanceCallback(metrics);
      }
    }, 5000);
  }

  getPerformanceMetrics() {
    return {
      cacheSize: this.cache.size,
      analysisCount: this.analysisCount || 0,
      averageAnalysisTime: this.averageAnalysisTime || 0,
      memoryUsage: this.estimateMemoryUsage(),
      uptime: performance.now() - this.startTime
    };
  }

  estimateMemoryUsage() {
    let size = 0;
    for (const [key, value] of this.cache) {
      size += key.length + JSON.stringify(value).length;
    }
    return size;
  }

  // Security scanning
  async scanForVulnerabilities(filename, content) {
    const vulnerabilities = [];
    
    // Common security patterns
    const securityPatterns = [
      { pattern: /eval\s*\(/, severity: 'high', message: 'Use of eval() can lead to code injection' },
      { pattern: /innerHTML\s*=/, severity: 'medium', message: 'innerHTML can lead to XSS, consider textContent' },
      { pattern: /dangerouslySetInnerHTML/, severity: 'medium', message: 'Ensure HTML is sanitized' },
      { pattern: /http:\/\//, severity: 'low', message: 'Consider using HTTPS' },
      { pattern: /console\.log/, severity: 'low', message: 'Remove console.log in production' },
      { pattern: /alert\s*\(/, severity: 'low', message: 'Remove alert() in production' }
    ];

    for (const rule of securityPatterns) {
      const matches = content.matchAll(new RegExp(rule.pattern, 'g'));
      for (const match of matches) {
        vulnerabilities.push({
          line: this.getLineNumber(content, match.index),
          severity: rule.severity,
          message: rule.message,
          code: match[0]
        });
      }
    }

    return vulnerabilities;
  }

  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  // Quality scoring
  calculateQualityScore(analysis) {
    let score = 100;
    
    // Deduct points for issues
    score -= analysis.errors.length * 10;
    score -= analysis.warnings.length * 5;
    score -= analysis.suggestions.length * 2;
    
    // Bonus for good practices
    if (analysis.performance.length === 0) score += 5;
    if (analysis.security.length === 0) score += 5;
    
    return Math.max(0, Math.min(100, score));
  }

  // Cleanup
  cleanup() {
    if (this.performanceInterval) {
      clearInterval(this.performanceInterval);
    }
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }
    this.cache.clear();
  }
}

// Export singleton instance
export const codeAnalyzer = new AutomatedCodeAnalyzer();
