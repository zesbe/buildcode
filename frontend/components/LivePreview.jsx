import React, { useState, useEffect, useRef } from 'react';
import { HiPlay, HiStop, HiArrowPath, HiDevicePhoneMobile, HiComputerDesktop, HiDeviceTablet, HiXMark, HiBolt, HiEye } from 'react-icons/hi2';
import { useLivePreview } from '../utils/livePreview';

export default function LivePreview({ files, selectedFile, showNotification, isOpen, onClose }) {
  const [previewStatus, setPreviewStatus] = useState({ isActive: false, previewMode: 'desktop' });
  const [previewContent, setPreviewContent] = useState('');
  const [currentDevice, setCurrentDevice] = useState('desktop');
  const [hotReloadEnabled, setHotReloadEnabled] = useState(true);
  const iframeRef = useRef(null);
  
  const { 
    startPreview, 
    stopPreview, 
    updatePreview, 
    onFileChange, 
    setPreviewDevice, 
    getStatus, 
    toggleHotReload, 
    getDevicePresets 
  } = useLivePreview();
  
  const devicePresets = getDevicePresets();
  
  useEffect(() => {
    if (isOpen) {
      updateStatus();
    }
  }, [isOpen]);
  
  useEffect(() => {
    if (previewStatus.isActive && files) {
      // Auto-update preview when files change
      Object.entries(files).forEach(([filename, content]) => {
        onFileChange(filename, content);
      });
    }
  }, [files, previewStatus.isActive]);
  
  const updateStatus = () => {
    const status = getStatus();
    setPreviewStatus(status);
    setCurrentDevice(status.previewMode);
    setHotReloadEnabled(status.hotReloadEnabled);
  };
  
  const handleStartPreview = () => {
    try {
      const result = startPreview(files, selectedFile);
      if (result.success) {
        showNotification('Live preview started! 🚀', 'success');
        updateStatus();
        generatePreviewContent();
      } else {
        showNotification('Failed to start preview', 'error');
      }
    } catch (error) {
      showNotification('Preview error: ' + error.message, 'error');
    }
  };
  
  const handleStopPreview = () => {
    const result = stopPreview();
    if (result.success) {
      showNotification('Live preview stopped', 'info');
      updateStatus();
      setPreviewContent('');
    }
  };
  
  const handleDeviceChange = (device) => {
    const result = setPreviewDevice(device);
    if (result.success) {
      setCurrentDevice(device);
      showNotification(`Preview mode: ${result.device.name}`, 'info');
    }
  };
  
  const handleToggleHotReload = () => {
    const result = toggleHotReload();
    if (result.success) {
      setHotReloadEnabled(result.enabled);
      showNotification(`Hot reload ${result.enabled ? 'enabled' : 'disabled'}`, 'info');
    }
  };
  
  const generatePreviewContent = () => {
    // Generate preview content based on files
    const htmlFiles = Object.keys(files).filter(f => f.endsWith('.html'));
    const jsFiles = Object.keys(files).filter(f => f.endsWith('.js') || f.endsWith('.jsx'));
    const cssFiles = Object.keys(files).filter(f => f.endsWith('.css'));
    const tsFiles = Object.keys(files).filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
    
    if (jsFiles.some(f => f.endsWith('.jsx')) || tsFiles.some(f => f.endsWith('.tsx'))) {
      setPreviewContent(generateReactPreview());
    } else if (htmlFiles.length > 0) {
      setPreviewContent(files[htmlFiles[0]]);
    } else {
      setPreviewContent(generateBasicPreview());
    }
  };
  
  const generateReactPreview = () => {
    const componentFiles = Object.entries(files)
      .filter(([filename, _]) => filename.endsWith('.jsx') || filename.endsWith('.tsx'));
    
    const mainComponent = componentFiles.find(([filename, _]) => 
      filename.toLowerCase().includes('app') || 
      filename.toLowerCase().includes('main') ||
      filename.toLowerCase().includes('index')
    ) || componentFiles[0];
    
    if (!mainComponent) {
      return generateErrorPreview('No React component found');
    }
    
    const [componentName, componentCode] = mainComponent;
    const cssContent = Object.entries(files)
      .filter(([f, _]) => f.endsWith('.css'))
      .map(([_, content]) => content)
      .join('\n\n');
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Live Preview - ${componentName}</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <style>
      body { 
        margin: 0; 
        padding: 20px; 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        background: #f8fafc;
      }
      .preview-container {
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        padding: 20px;
        min-height: 200px;
      }
      ${cssContent}
    </style>
</head>
<body>
    <div id="root">
      <div class="preview-container">
        <div style="color: #6b7280; text-align: center; padding: 40px;">
          Loading React component...
        </div>
      </div>
    </div>
    
    <script type="text/babel">
      try {
        ${transpileReactCode(componentCode)}
        
        const container = document.getElementById('root');
        const root = ReactDOM.createRoot(container);
        root.render(React.createElement(App));
      } catch (error) {
        document.getElementById('root').innerHTML = \`
          <div class="preview-container">
            <div style="color: #dc2626; background: #fef2f2; border: 1px solid #fecaca; border-radius: 4px; padding: 12px; margin: 10px 0;">
              <strong>Preview Error:</strong><br>
              \${error.message}
            </div>
          </div>
        \`;
      }
    </script>
</body>
</html>`;
  };
  
  const generateBasicPreview = () => {
    const jsContent = Object.entries(files)
      .filter(([f, _]) => f.endsWith('.js'))
      .map(([_, content]) => content)
      .join('\n\n');
    
    const cssContent = Object.entries(files)
      .filter(([f, _]) => f.endsWith('.css'))
      .map(([_, content]) => content)
      .join('\n\n');
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Live Preview</title>
    <style>
      body { 
        margin: 0; 
        padding: 20px; 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }
      ${cssContent}
    </style>
</head>
<body>
    <div id="app">
      <h1>Live Preview</h1>
      <p>Your code is running here!</p>
    </div>
    
    <script>
      ${jsContent}
    </script>
</body>
</html>`;
  };
  
  const generateErrorPreview = (error) => {
    return `
<!DOCTYPE html>
<html>
<head><title>Preview Error</title></head>
<body style="padding: 40px; font-family: sans-serif; background: #fef2f2;">
  <div style="background: white; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; color: #dc2626;">
    <h2>Preview Error</h2>
    <p>${error}</p>
  </div>
</body>
</html>`;
  };
  
  const transpileReactCode = (code) => {
    if (!code || typeof code !== 'string') {
      return '// No code to transpile';
    }
    return code
      .replace(/export default function (\w+)/g, 'function App')
      .replace(/export default (\w+)/g, 'const App = $1')
      .replace(/import .* from .*/g, '')
      .replace(/export \{[^}]*\}/g, '');
  };
  
  const getDeviceIcon = (device) => {
    switch (device) {
      case 'mobile':
      case 'iphone':
      case 'android':
        return HiDevicePhoneMobile;
      case 'tablet':
        return HiDeviceTablet;
      default:
        return HiComputerDesktop;
    }
  };
  
  if (!isOpen) return null;
  
  const currentPreset = devicePresets[currentDevice];
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg">
              <HiEye className="text-white w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Live Preview</h2>
              <p className="text-sm text-slate-400">Real-time preview with hot reload</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <HiXMark className="w-5 h-5" />
          </button>
        </div>
        
        {/* Controls */}
        <div className="flex items-center justify-between p-4 bg-slate-900/50 border-b border-slate-700">
          <div className="flex items-center gap-3">
            {/* Preview Controls */}
            <div className="flex items-center gap-1 bg-slate-700/50 rounded-lg p-1">
              <button
                onClick={handleStartPreview}
                disabled={previewStatus.isActive}
                className="p-2 text-slate-400 hover:text-green-400 hover:bg-green-500/10 rounded-md transition-all disabled:opacity-50"
                title="Start Preview"
              >
                <HiPlay className="w-4 h-4" />
              </button>
              <button
                onClick={handleStopPreview}
                disabled={!previewStatus.isActive}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all disabled:opacity-50"
                title="Stop Preview"
              >
                <HiStop className="w-4 h-4" />
              </button>
              <button
                onClick={generatePreviewContent}
                disabled={!previewStatus.isActive}
                className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-md transition-all disabled:opacity-50"
                title="Refresh Preview"
              >
                <HiArrowPath className="w-4 h-4" />
              </button>
            </div>
            
            {/* Hot Reload Toggle */}
            <button
              onClick={handleToggleHotReload}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                hotReloadEnabled
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-slate-700/50 text-slate-400 border border-slate-600'
              }`}
            >
              <HiBolt className="w-4 h-4 inline-block mr-1" />
              Hot Reload
            </button>
          </div>
          
          {/* Device Selection */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400 mr-2">Device:</span>
            {Object.entries(devicePresets).map(([key, preset]) => {
              const IconComponent = getDeviceIcon(key);
              return (
                <button
                  key={key}
                  onClick={() => handleDeviceChange(key)}
                  className={`p-2 rounded-lg transition-colors ${
                    currentDevice === key
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                  }`}
                  title={preset.name}
                >
                  <IconComponent className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Preview Area */}
        <div className="flex-1 flex items-center justify-center p-8 bg-slate-900/30">
          {previewStatus.isActive && previewContent ? (
            <div 
              className="bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300"
              style={{
                width: currentPreset.width,
                height: currentPreset.height,
                maxWidth: '100%',
                maxHeight: '100%'
              }}
            >
              <div className="bg-slate-100 px-4 py-2 border-b flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <div className="text-xs text-slate-500 ml-2">
                  {currentPreset.name} ({currentPreset.width}×{currentPreset.height})
                </div>
                {hotReloadEnabled && (
                  <div className="ml-auto flex items-center gap-1 text-xs text-green-600">
                    <HiBolt className="w-3 h-3" />
                    Live
                  </div>
                )}
              </div>
              <iframe
                ref={iframeRef}
                srcDoc={previewContent}
                className="w-full h-full border-0"
                style={{ height: currentPreset.height - 40 }}
                title="Live Preview"
              />
            </div>
          ) : (
            <div className="text-center">
              <div className="w-24 h-24 bg-slate-700/50 rounded-full flex items-center justify-center mb-4 mx-auto">
                <HiEye className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Start Live Preview</h3>
              <p className="text-slate-400 mb-4">
                Click the play button to see your code in action with real-time updates.
              </p>
              <button
                onClick={handleStartPreview}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 mx-auto"
              >
                <HiPlay className="w-5 h-5" />
                Start Preview
              </button>
            </div>
          )}
        </div>
        
        {/* Status Bar */}
        <div className="px-4 py-2 bg-slate-800/50 border-t border-slate-700 text-xs text-slate-400">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span>Status: {previewStatus.isActive ? 'Active' : 'Inactive'}</span>
              <span>Files: {Object.keys(files || {}).length}</span>
              <span>Mode: {currentPreset.name}</span>
            </div>
            <div className="flex items-center gap-2">
              {hotReloadEnabled && (
                <div className="flex items-center gap-1 text-green-400">
                  <HiBolt className="w-3 h-3" />
                  Hot Reload Enabled
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
