import React, { useState, useEffect, useRef } from 'react';
import { HiBug, HiCommandLine, HiEye, HiXMark, HiExclamationTriangle } from 'react-icons/hi2';

export default function WebInspector({ isOpen, onClose, showNotification }) {
  const [logs, setLogs] = useState([]);
  const [errors, setErrors] = useState([]);
  const [networkRequests, setNetworkRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('console');
  const consoleRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // Capture console logs
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    console.log = (...args) => {
      originalLog(...args);
      setLogs(prev => [...prev, {
        type: 'log',
        message: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' '),
        timestamp: new Date().toLocaleTimeString(),
        id: Date.now() + Math.random()
      }]);
    };

    console.error = (...args) => {
      originalError(...args);
      const errorMsg = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' ');
      setErrors(prev => [...prev, {
        type: 'error',
        message: errorMsg,
        timestamp: new Date().toLocaleTimeString(),
        id: Date.now() + Math.random()
      }]);
      setLogs(prev => [...prev, {
        type: 'error',
        message: errorMsg,
        timestamp: new Date().toLocaleTimeString(),
        id: Date.now() + Math.random()
      }]);
    };

    console.warn = (...args) => {
      originalWarn(...args);
      const warnMsg = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' ');
      setLogs(prev => [...prev, {
        type: 'warn',
        message: warnMsg,
        timestamp: new Date().toLocaleTimeString(),
        id: Date.now() + Math.random()
      }]);
    };

    // Capture network requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = Date.now();
      const url = args[0];
      const options = args[1] || {};
      
      try {
        const response = await originalFetch(...args);
        const duration = Date.now() - startTime;
        
        setNetworkRequests(prev => [...prev, {
          url,
          method: options.method || 'GET',
          status: response.status,
          statusText: response.statusText,
          duration,
          timestamp: new Date().toLocaleTimeString(),
          id: Date.now() + Math.random()
        }]);
        
        return response;
      } catch (error) {
        const duration = Date.now() - startTime;
        
        setNetworkRequests(prev => [...prev, {
          url,
          method: options.method || 'GET',
          status: 'Failed',
          statusText: error.message,
          duration,
          timestamp: new Date().toLocaleTimeString(),
          id: Date.now() + Math.random(),
          error: true
        }]);
        
        throw error;
      }
    };

    // Capture unhandled errors
    const handleError = (event) => {
      setErrors(prev => [...prev, {
        type: 'error',
        message: `${event.error?.message || event.message} at ${event.filename}:${event.lineno}`,
        timestamp: new Date().toLocaleTimeString(),
        id: Date.now() + Math.random(),
        stack: event.error?.stack
      }]);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', (event) => {
      setErrors(prev => [...prev, {
        type: 'error',
        message: `Unhandled Promise Rejection: ${event.reason}`,
        timestamp: new Date().toLocaleTimeString(),
        id: Date.now() + Math.random()
      }]);
    });

    // Cleanup
    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
      window.fetch = originalFetch;
      window.removeEventListener('error', handleError);
    };
  }, [isOpen]);

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs]);

  const clearLogs = () => {
    setLogs([]);
    setErrors([]);
    setNetworkRequests([]);
    showNotification('Inspector logs cleared', 'success');
  };

  const exportLogs = () => {
    const exportData = {
      logs,
      errors,
      networkRequests,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inspector-logs-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showNotification('Logs exported successfully', 'success');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-6xl h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <HiBug className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Web Inspector</h2>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span>Errors: {errors.length}</span>
              <span>•</span>
              <span>Logs: {logs.length}</span>
              <span>•</span>
              <span>Network: {networkRequests.length}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearLogs}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors"
            >
              Clear
            </button>
            <button
              onClick={exportLogs}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
            >
              Export
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <HiXMark className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700">
          <button
            onClick={() => setActiveTab('console')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'console'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Console ({logs.length})
          </button>
          <button
            onClick={() => setActiveTab('errors')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'errors'
                ? 'text-red-400 border-b-2 border-red-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Errors ({errors.length})
          </button>
          <button
            onClick={() => setActiveTab('network')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'network'
                ? 'text-green-400 border-b-2 border-green-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Network ({networkRequests.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'console' && (
            <div ref={consoleRef} className="h-full overflow-y-auto p-4 space-y-2">
              {logs.length === 0 ? (
                <div className="text-center text-slate-500 py-8">
                  <HiCommandLine className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No console logs yet. Interact with the app to see logs here.</p>
                </div>
              ) : (
                logs.map(log => (
                  <div key={log.id} className={`flex gap-3 p-2 rounded ${
                    log.type === 'error' ? 'bg-red-500/10 border-l-2 border-red-500' :
                    log.type === 'warn' ? 'bg-yellow-500/10 border-l-2 border-yellow-500' :
                    'bg-slate-800/50'
                  }`}>
                    <span className="text-slate-400 text-xs flex-shrink-0 font-mono">
                      {log.timestamp}
                    </span>
                    <pre className={`text-sm font-mono flex-1 whitespace-pre-wrap ${
                      log.type === 'error' ? 'text-red-400' :
                      log.type === 'warn' ? 'text-yellow-400' :
                      'text-slate-300'
                    }`}>
                      {log.message}
                    </pre>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'errors' && (
            <div className="h-full overflow-y-auto p-4 space-y-2">
              {errors.length === 0 ? (
                <div className="text-center text-slate-500 py-8">
                  <HiExclamationTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No errors detected. Great job! 🎉</p>
                </div>
              ) : (
                errors.map(error => (
                  <div key={error.id} className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <HiExclamationTriangle className="w-4 h-4 text-red-400" />
                      <span className="text-red-400 font-medium text-sm">{error.timestamp}</span>
                    </div>
                    <pre className="text-red-300 text-sm font-mono whitespace-pre-wrap">
                      {error.message}
                    </pre>
                    {error.stack && (
                      <details className="mt-2">
                        <summary className="text-red-400 text-xs cursor-pointer">Stack trace</summary>
                        <pre className="text-red-300/70 text-xs font-mono mt-1 whitespace-pre-wrap">
                          {error.stack}
                        </pre>
                      </details>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'network' && (
            <div className="h-full overflow-y-auto p-4">
              {networkRequests.length === 0 ? (
                <div className="text-center text-slate-500 py-8">
                  <HiEye className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No network requests yet. Make API calls to see them here.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {networkRequests.map(request => (
                    <div key={request.id} className={`p-3 rounded-lg ${
                      request.error ? 'bg-red-500/10 border border-red-500/20' : 'bg-slate-800/50'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 rounded text-xs font-mono ${
                            request.method === 'GET' ? 'bg-blue-500/20 text-blue-400' :
                            request.method === 'POST' ? 'bg-green-500/20 text-green-400' :
                            request.method === 'PUT' ? 'bg-yellow-500/20 text-yellow-400' :
                            request.method === 'DELETE' ? 'bg-red-500/20 text-red-400' :
                            'bg-slate-500/20 text-slate-400'
                          }`}>
                            {request.method}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-mono ${
                            request.status >= 200 && request.status < 300 ? 'bg-green-500/20 text-green-400' :
                            request.status >= 400 ? 'bg-red-500/20 text-red-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {request.status}
                          </span>
                          <span className="text-slate-400 text-xs">{request.duration}ms</span>
                        </div>
                        <span className="text-slate-500 text-xs">{request.timestamp}</span>
                      </div>
                      <div className="text-slate-300 text-sm font-mono break-all">
                        {request.url}
                      </div>
                      {request.statusText && (
                        <div className="text-slate-400 text-xs mt-1">
                          {request.statusText}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}