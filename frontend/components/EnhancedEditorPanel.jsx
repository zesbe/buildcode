import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { HiOutlineDocumentText, HiXMark, HiCloudArrowUp, HiBugAnt, HiLightBulb, HiShieldCheck, HiBolt } from "react-icons/hi2";
import { codeAnalyzer } from "../utils/automatedCodeAnalysis";
import MonacoErrorBoundary from "./MonacoErrorBoundary";
import "../utils/suppressResizeObserverErrors";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

export default function EnhancedEditorPanel({ 
  filename, 
  value, 
  language, 
  onChange, 
  onClose, 
  onSave, 
  hasChanges = false,
  files = {},
  setFiles,
  showNotification,
  selectedModel = "claude-sonnet-4-20250514"
}) {
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [autoFixEnabled, setAutoFixEnabled] = useState(true);
  const [completions, setCompletions] = useState([]);
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(false);
  
  const analyzerRef = useRef(null);
  const editorRef = useRef(null);
  const analysisTimeoutRef = useRef(null);
  const providersRef = useRef([]);

  // Initialize automated analyzer
  useEffect(() => {
    if (files && setFiles && showNotification) {
      analyzerRef.current = codeAnalyzer;
      analyzerRef.current.autoFixEnabled = autoFixEnabled;
    }
  }, [files, setFiles, showNotification, selectedModel, autoFixEnabled]);

  // Real-time analysis on content change
  useEffect(() => {
    if (!value || !filename || !analyzerRef.current) return;

    // Debounce analysis
    if (analysisTimeoutRef.current) {
      clearTimeout(analysisTimeoutRef.current);
    }

    analysisTimeoutRef.current = setTimeout(async () => {
      setIsAnalyzing(true);
      try {
        const result = await analyzerRef.current.analyzeCodeRealTime(
          filename, 
          value, 
          onChange
        );
        setAnalysis(result);
      } catch (error) {
        console.error('Analysis failed:', error);
      } finally {
        setIsAnalyzing(false);
      }
    }, 1000); // Analyze 1 second after user stops typing

    return () => {
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
      }
    };
  }, [value, filename, onChange]);

  // Handle editor mount
  const handleEditorDidMount = (editor, monaco) => {
    try {
      editorRef.current = editor;

      // Clear any existing providers safely
      providersRef.current.forEach(provider => {
        try {
          if (provider && typeof provider.dispose === 'function') {
            provider.dispose();
          }
        } catch (e) {
          console.warn('Failed to dispose provider:', e);
        }
      });
      providersRef.current = [];

      // Monaco Editor has its own resize handling
      // Just ensure proper layout on mount
      setTimeout(() => {
        if (editor && editor.layout && !editor.isDisposed?.()) {
          try {
            editor.layout();
          } catch (e) {
            console.warn('Editor layout error:', e);
          }
        }
      }, 100);

    // Add custom error markers
    if (analysis?.errors) {
      const markers = analysis.errors.map(error => ({
        startLineNumber: error.line,
        startColumn: 1,
        endLineNumber: error.line,
        endColumn: 1000,
        message: error.message,
        severity: monaco.MarkerSeverity.Error
      }));
      monaco.editor.setModelMarkers(editor.getModel(), 'ai-analysis', markers);
    }

    // Add auto-completion provider
    const completionProvider = monaco.languages.registerCompletionItemProvider(language, {
      provideCompletionItems: async (model, position) => {
        if (!analyzerRef.current) return { suggestions: [] };

        try {
          const offset = model.getOffsetAt(position);
          const completions = await analyzerRef.current.getAutoCompletions(filename, value, offset);

          return {
            suggestions: completions.map(completion => ({
              label: completion.text,
              kind: monaco.languages.CompletionItemKind.Snippet,
              documentation: completion.detail,
              insertText: completion.text
            }))
          };
        } catch (e) {
          console.warn('Completion provider error:', e);
          return { suggestions: [] };
        }
      }
    });
    providersRef.current.push(completionProvider);

    // Add hover provider for AI insights
    const hoverProvider = monaco.languages.registerHoverProvider(language, {
      provideHover: (model, position) => {
        try {
          if (!analysis) return null;

          const line = position.lineNumber;
          const error = analysis.errors?.find(e => e.line === line);
          const warning = analysis.warnings?.find(w => w.line === line);
          const suggestion = analysis.suggestions?.find(s => s.line === line);

          if (error || warning || suggestion) {
            const content = [
              error && `❌ Error: ${error.message}`,
              warning && `⚠️ Warning: ${warning.message}`,
              suggestion && `💡 Suggestion: ${suggestion.message}`
            ].filter(Boolean).join('\n\n');

            return {
              contents: [{ value: content }]
            };
          }

          return null;
        } catch (e) {
          console.warn('Hover provider error:', e);
          return null;
        }
      }
    });
    providersRef.current.push(hoverProvider);

    // Add code action provider for quick fixes
    const codeActionProvider = monaco.languages.registerCodeActionProvider(language, {
      provideCodeActions: (model, range, context) => {
        try {
          if (!analysis?.autoFixes) return { actions: [] };

          const line = range.startLineNumber;
          const fix = analysis.autoFixes.find(f => f.line === line);

          if (fix) {
            return {
              actions: [{
                title: `🔧 Auto-fix: ${fix.type}`,
                kind: 'quickfix',
                edit: {
                  edits: [{
                    resource: model.uri,
                    edit: {
                      range: {
                        startLineNumber: line,
                        startColumn: 1,
                        endLineNumber: line,
                        endColumn: model.getLineLength(line) + 1
                      },
                      text: fix.fixed
                    }
                  }]
                }
              }]
            };
          }

          return { actions: [] };
        } catch (e) {
          console.warn('Code action provider error:', e);
          return { actions: [] };
        }
      }
    });
    providersRef.current.push(codeActionProvider);
    } catch (error) {
      console.error('Editor mount error:', error);
      // Fallback - clear refs to prevent further errors
      editorRef.current = null;
      providersRef.current = [];
    }
  };

  // Update markers when analysis changes
  useEffect(() => {
    if (editorRef.current && analysis?.errors) {
      const monaco = window.monaco;
      if (monaco && editorRef.current.getModel()) {
        try {
          const markers = analysis.errors.map(error => ({
            startLineNumber: error.line,
            startColumn: 1,
            endLineNumber: error.line,
            endColumn: 1000,
            message: error.message,
            severity: monaco.MarkerSeverity.Error
          }));
          monaco.editor.setModelMarkers(editorRef.current.getModel(), 'ai-analysis', markers);
        } catch (e) {
          console.warn('Failed to set markers:', e);
        }
      }
    }
  }, [analysis]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear analysis timeout
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
      }

      // Dispose providers safely
      providersRef.current.forEach(provider => {
        try {
          if (provider && typeof provider.dispose === 'function') {
            provider.dispose();
          }
        } catch (e) {
          console.warn('Failed to dispose provider:', e);
        }
      });
      providersRef.current = [];

      // Clear markers safely
      if (editorRef.current && window.monaco) {
        try {
          const model = editorRef.current.getModel();
          if (model && !model.isDisposed()) {
            window.monaco.editor.setModelMarkers(model, 'ai-analysis', []);
          }
        } catch (e) {
          console.warn('Failed to clear markers:', e);
        }
      }

      // Dispose editor safely
      if (editorRef.current) {
        try {
          if (typeof editorRef.current.dispose === 'function') {
            editorRef.current.dispose();
          }
        } catch (e) {
          console.warn('Failed to dispose editor:', e);
        }
      }

      // Reset refs
      editorRef.current = null;
      analyzerRef.current = null;
    };
  }, []);

  // Calculate analysis status
  const getAnalysisStatus = () => {
    if (!analysis) return { color: 'slate', text: 'No analysis' };
    
    const errorCount = analysis.errors.length;
    const warningCount = analysis.warnings.length;
    
    if (errorCount > 0) return { color: 'red', text: `${errorCount} errors` };
    if (warningCount > 0) return { color: 'yellow', text: `${warningCount} warnings` };
    if (analysis.quality > 80) return { color: 'green', text: 'Excellent' };
    if (analysis.quality > 60) return { color: 'blue', text: 'Good' };
    return { color: 'orange', text: 'Needs work' };
  };

  const status = getAnalysisStatus();

  return (
    <div className="flex flex-col h-full bg-slate-900/50 backdrop-blur border border-slate-700/30 m-4 rounded-xl shadow-2xl overflow-hidden">
      {/* Enhanced Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/70 border-b border-slate-700/50">
        <HiOutlineDocumentText className="text-blue-400 w-[18px] h-[18px]" />
        <span className="font-mono text-sm text-slate-200 font-medium flex items-center gap-2">
          {filename}
          {hasChanges && <div className="w-1.5 h-1.5 bg-orange-400 rounded-full" title="Unsaved changes"></div>}
        </span>

        {/* Analysis Status */}
        <div className="flex items-center gap-2 ml-4">
          {isAnalyzing ? (
            <div className="flex items-center gap-2 text-blue-400">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-xs">Analyzing...</span>
            </div>
          ) : (
            <div className={`flex items-center gap-2 text-${status.color}-400`}>
              <div className={`w-2 h-2 bg-${status.color}-400 rounded-full`}></div>
              <span className="text-xs">{status.text}</span>
            </div>
          )}
        </div>

        {/* Quality Score */}
        {analysis?.quality && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-400">Quality:</span>
            <span className={`text-xs font-bold ${
              analysis.quality > 80 ? 'text-green-400' : 
              analysis.quality > 60 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {analysis.quality}%
            </span>
          </div>
        )}

        <div className="ml-auto flex items-center gap-3">
          {/* Analysis Toggle */}
          <button
            onClick={() => setShowAnalysisPanel(!showAnalysisPanel)}
            className={`p-1.5 rounded-lg transition-colors ${
              showAnalysisPanel 
                ? 'bg-blue-500/20 text-blue-400' 
                : 'text-slate-400 hover:text-blue-400 hover:bg-slate-700/50'
            }`}
            title="Toggle analysis panel"
          >
            <HiBugAnt className="w-3.5 h-3.5" />
          </button>

          {/* Auto-fix Toggle */}
          <button
            onClick={() => setAutoFixEnabled(!autoFixEnabled)}
            className={`p-1.5 rounded-lg transition-colors ${
              autoFixEnabled 
                ? 'bg-green-500/20 text-green-400' 
                : 'text-slate-400 hover:text-green-400 hover:bg-slate-700/50'
            }`}
            title="Toggle auto-fix"
          >
            <HiBolt className="w-3.5 h-3.5" />
          </button>

          {/* Save Button */}
          {onSave && (
            <button
              onClick={onSave}
              className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-700/50 rounded-lg transition-colors"
              title="Save file (Ctrl+S)"
            >
              <HiCloudArrowUp className="w-3.5 h-3.5" />
            </button>
          )}
          
          {/* Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              title="Close file"
            >
              <HiXMark className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor */}
        <div className="flex-1">
          <MonacoErrorBoundary>
            <div className="h-full">
              <MonacoEditor
                key={`${filename}-${language}`}
                height="100%"
                language={language}
                value={value}
                onChange={onChange}
                onMount={handleEditorDidMount}
                theme="vs-dark"
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  fontFamily: "JetBrains Mono, Menlo, Monaco, 'Courier New', monospace",
                  scrollbar: { vertical: "auto", horizontal: "auto" },
                  smoothScrolling: true,
                  roundedSelection: true,
                  cursorBlinking: "smooth",
                  lineNumbers: "on",
                  folding: true,
                  wordWrap: "on",
                  automaticLayout: true,
                  quickSuggestions: true,
                  suggestOnTriggerCharacters: true,
                  acceptSuggestionOnEnter: "on",
                  tabCompletion: "on",
                  hover: { enabled: true },
                  lightbulb: { enabled: true }
                }}
                loading={
                  <div className="flex items-center justify-center h-full bg-slate-900">
                    <div className="text-slate-400">Loading editor...</div>
                  </div>
                }
              />
            </div>
          </MonacoErrorBoundary>
        </div>

        {/* Analysis Panel */}
        {showAnalysisPanel && analysis && (
          <div className="w-80 bg-slate-800/50 border-l border-slate-700/50 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <HiBugAnt className="w-4 h-4" />
                Code Analysis
              </h3>

              {/* Errors */}
              {analysis.errors.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-red-400 mb-2 flex items-center gap-1">
                    <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                    Errors ({analysis.errors.length})
                  </h4>
                  <div className="space-y-2">
                    {analysis.errors.map((error, i) => (
                      <div key={i} className="p-2 bg-red-500/10 border border-red-500/20 rounded text-xs">
                        <div className="text-red-400 font-medium">Line {error.line}</div>
                        <div className="text-slate-300">{error.message}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {analysis.warnings.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-yellow-400 mb-2 flex items-center gap-1">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                    Warnings ({analysis.warnings.length})
                  </h4>
                  <div className="space-y-2">
                    {analysis.warnings.map((warning, i) => (
                      <div key={i} className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs">
                        <div className="text-yellow-400 font-medium">Line {warning.line}</div>
                        <div className="text-slate-300">{warning.message}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {analysis.suggestions.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-blue-400 mb-2 flex items-center gap-1">
                    <HiLightBulb className="w-3 h-3" />
                    Suggestions ({analysis.suggestions.length})
                  </h4>
                  <div className="space-y-2">
                    {analysis.suggestions.map((suggestion, i) => (
                      <div key={i} className="p-2 bg-blue-500/10 border border-blue-500/20 rounded text-xs">
                        <div className="text-blue-400 font-medium">{suggestion.type}</div>
                        <div className="text-slate-300">{suggestion.message}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Security Issues */}
              {analysis.security.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-purple-400 mb-2 flex items-center gap-1">
                    <HiShieldCheck className="w-3 h-3" />
                    Security ({analysis.security.length})
                  </h4>
                  <div className="space-y-2">
                    {analysis.security.map((issue, i) => (
                      <div key={i} className="p-2 bg-purple-500/10 border border-purple-500/20 rounded text-xs">
                        <div className="text-purple-400 font-medium">{issue.severity} severity</div>
                        <div className="text-slate-300">{issue.message}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Performance */}
              {analysis.performance.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-green-400 mb-2 flex items-center gap-1">
                    <HiBolt className="w-3 h-3" />
                    Performance ({analysis.performance.length})
                  </h4>
                  <div className="space-y-2">
                    {analysis.performance.map((perf, i) => (
                      <div key={i} className="p-2 bg-green-500/10 border border-green-500/20 rounded text-xs">
                        <div className="text-green-400 font-medium">{perf.impact} impact</div>
                        <div className="text-slate-300">{perf.message}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Auto-fix Status */}
              {autoFixEnabled && (
                <div className="p-2 bg-slate-700/30 rounded text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <HiBolt className="text-green-400 w-3 h-3" />
                    <span>Auto-fix enabled</span>
                  </div>
                  <div className="mt-1">Critical issues will be fixed automatically</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
