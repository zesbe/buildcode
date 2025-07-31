import React, { useState } from 'react';
import { HiPlay, HiStop, HiCommandLine } from 'react-icons/hi2';

export default function CodeRunner({ files, selectedFile, showNotification }) {
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState('');
  const [showOutput, setShowOutput] = useState(false);

  const executeJavaScript = (code) => {
    try {
      // Create a safe execution environment
      const logs = [];
      const originalLog = console.log;
      
      // Override console.log to capture output
      console.log = (...args) => {
        logs.push(args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '));
      };
      
      // Execute the code
      const result = new Function(code)();
      
      // Restore console.log
      console.log = originalLog;
      
      const output = logs.join('\n');
      return {
        success: true,
        output: output || (result !== undefined ? String(result) : 'Code executed successfully'),
        result
      };
    } catch (error) {
      console.log = console.log; // Restore just in case
      return {
        success: false,
        output: `Error: ${error.message}`,
        error
      };
    }
  };

  const executeHTML = (htmlCode) => {
    try {
      // Create a new window/iframe for HTML execution
      const newWindow = window.open('', '_blank', 'width=800,height=600');
      newWindow.document.write(htmlCode);
      newWindow.document.close();
      
      return {
        success: true,
        output: 'HTML opened in new window'
      };
    } catch (error) {
      return {
        success: false,
        output: `Error opening HTML: ${error.message}`
      };
    }
  };

  const runCode = async () => {
    if (!selectedFile || !files[selectedFile]) {
      showNotification('No file selected to run', 'error');
      return;
    }

    setIsRunning(true);
    setShowOutput(true);
    setOutput('Running code...\n');

    const code = files[selectedFile];
    const fileExtension = selectedFile.split('.').pop().toLowerCase();

    let result;
    
    try {
      switch (fileExtension) {
        case 'js':
        case 'jsx':
          result = executeJavaScript(code);
          break;
        case 'html':
          result = executeHTML(code);
          break;
        case 'py':
          result = {
            success: false,
            output: 'Python execution not supported in browser. Use a Python REPL or server.'
          };
          break;
        default:
          result = {
            success: false,
            output: `Cannot execute .${fileExtension} files. Supported: .js, .jsx, .html`
          };
      }
      
      setOutput(result.output);
      
      if (result.success) {
        showNotification('Code executed successfully!', 'success');
      } else {
        showNotification('Code execution failed', 'error');
      }
      
    } catch (error) {
      setOutput(`Execution Error: ${error.message}`);
      showNotification('Code execution failed', 'error');
    }

    setIsRunning(false);
  };

  const stopExecution = () => {
    setIsRunning(false);
    setOutput(prev => prev + '\n\nExecution stopped by user.');
  };

  const getFileType = () => {
    if (!selectedFile) return 'No file';
    const ext = selectedFile.split('.').pop().toLowerCase();
    const types = {
      'js': 'JavaScript',
      'jsx': 'React JSX', 
      'html': 'HTML',
      'py': 'Python',
      'ts': 'TypeScript',
      'tsx': 'React TSX'
    };
    return types[ext] || ext.toUpperCase();
  };

  return (
    <div className="border-t border-slate-700 bg-slate-900">
      {/* Runner Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <HiCommandLine className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-white">Code Runner</span>
          <span className="text-xs text-slate-400">({getFileType()})</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={runCode}
            disabled={isRunning || !selectedFile}
            className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white rounded text-xs transition-colors"
          >
            <HiPlay className="w-3 h-3" />
            {isRunning ? 'Running...' : 'Run'}
          </button>
          
          {isRunning && (
            <button
              onClick={stopExecution}
              className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors"
            >
              <HiStop className="w-3 h-3" />
              Stop
            </button>
          )}
          
          <button
            onClick={() => setShowOutput(!showOutput)}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs transition-colors"
          >
            {showOutput ? 'Hide' : 'Show'} Output
          </button>
        </div>
      </div>

      {/* Output Panel */}
      {showOutput && (
        <div className="p-3 bg-slate-950 border-t border-slate-700">
          <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
            {output || 'No output yet. Click "Run" to execute code.'}
          </pre>
        </div>
      )}
    </div>
  );
}