// Live Preview & Hot Reload System
class LivePreviewManager {
  constructor() {
    this.previewWindow = null;
    this.previewIframe = null;
    this.isActive = false;
    this.previewMode = 'desktop'; // desktop, tablet, mobile
    this.currentFiles = {};
    this.hotReloadEnabled = true;
    this.previewUrl = '';
    this.lastUpdate = Date.now();
    
    // Device presets
    this.devicePresets = {
      desktop: { width: 1200, height: 800, name: 'Desktop' },
      laptop: { width: 1024, height: 768, name: 'Laptop' },
      tablet: { width: 768, height: 1024, name: 'Tablet' },
      mobile: { width: 375, height: 667, name: 'Mobile' },
      iphone: { width: 414, height: 896, name: 'iPhone' },
      android: { width: 360, height: 640, name: 'Android' }
    };
    
    this.initializePreview();
  }
  
  initializePreview() {
    // Create preview container
    this.createPreviewContainer();
    
    // Setup hot reload WebSocket (simulated)
    this.setupHotReload();
    
    // Setup responsive preview
    this.setupResponsivePreview();
  }
  
  createPreviewContainer() {
    // This would typically create an iframe or open a new window
    // For now, we'll simulate the preview environment
    console.log('Live Preview initialized');
  }
  
  // Start live preview
  startPreview(files, selectedFile) {
    this.currentFiles = { ...files };
    this.isActive = true;
    
    // Generate preview content
    const previewContent = this.generatePreviewContent(files, selectedFile);
    
    // Update preview
    this.updatePreview(previewContent);
    
    return {
      success: true,
      url: this.generatePreviewUrl(),
      message: 'Live preview started'
    };
  }
  
  // Stop live preview
  stopPreview() {
    this.isActive = false;
    if (this.previewIframe) {
      this.previewIframe.src = 'about:blank';
    }
    
    return {
      success: true,
      message: 'Live preview stopped'
    };
  }
  
  // Generate preview content from files
  generatePreviewContent(files, entryFile = 'index.html') {
    const htmlFiles = Object.keys(files).filter(f => f.endsWith('.html'));
    const jsFiles = Object.keys(files).filter(f => f.endsWith('.js') || f.endsWith('.jsx'));
    const cssFiles = Object.keys(files).filter(f => f.endsWith('.css'));
    const tsFiles = Object.keys(files).filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
    
    // If we have React files, generate a React preview
    if (jsFiles.some(f => f.endsWith('.jsx')) || tsFiles.some(f => f.endsWith('.tsx'))) {
      return this.generateReactPreview(files);
    }
    
    // If we have HTML files, use them directly
    if (htmlFiles.length > 0) {
      return this.generateHTMLPreview(files, htmlFiles[0]);
    }
    
    // Generate a basic HTML preview
    return this.generateBasicPreview(files);
  }
  
  generateReactPreview(files) {
    const componentFiles = Object.entries(files)
      .filter(([filename, _]) => filename.endsWith('.jsx') || filename.endsWith('.tsx'));
    
    const mainComponent = componentFiles.find(([filename, _]) => 
      filename.toLowerCase().includes('app') || 
      filename.toLowerCase().includes('main') ||
      filename.toLowerCase().includes('index')
    ) || componentFiles[0];
    
    if (!mainComponent) {
      return this.generateErrorPreview('No React component found');
    }
    
    const [componentName, componentCode] = mainComponent;
    
    // Basic React preview template
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
    ${this.generateCSSIncludes(files)}
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
      .preview-error {
        color: #dc2626;
        background: #fef2f2;
        border: 1px solid #fecaca;
        border-radius: 4px;
        padding: 12px;
        margin: 10px 0;
      }
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
        ${this.transpileReactCode(componentCode)}
        
        const container = document.getElementById('root');
        const root = ReactDOM.createRoot(container);
        root.render(React.createElement(App));
      } catch (error) {
        document.getElementById('root').innerHTML = \`
          <div class="preview-container">
            <div class="preview-error">
              <strong>Preview Error:</strong><br>
              \${error.message}
            </div>
          </div>
        \`;
      }
    </script>
    
    ${this.generateHotReloadScript()}
</body>
</html>`;
  }
  
  generateHTMLPreview(files, htmlFile) {
    let content = files[htmlFile];
    
    // Inject CSS files
    const cssIncludes = this.generateCSSIncludes(files);
    content = content.replace('</head>', `${cssIncludes}</head>`);
    
    // Inject JS files
    const jsIncludes = this.generateJSIncludes(files);
    content = content.replace('</body>', `${jsIncludes}${this.generateHotReloadScript()}</body>`);
    
    return content;
  }
  
  generateBasicPreview(files) {
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
    
    ${this.generateHotReloadScript()}
</body>
</html>`;
  }
  
  generateErrorPreview(error) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview Error</title>
    <style>
      body { 
        margin: 0; 
        padding: 40px; 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        background: #fef2f2;
      }
      .error-container {
        background: white;
        border: 1px solid #fecaca;
        border-radius: 8px;
        padding: 20px;
        color: #dc2626;
      }
    </style>
</head>
<body>
    <div class="error-container">
      <h2>Preview Error</h2>
      <p>${error}</p>
    </div>
</body>
</html>`;
  }
  
  generateCSSIncludes(files) {
    return Object.entries(files)
      .filter(([filename, _]) => filename.endsWith('.css'))
      .map(([filename, content]) => `<style>/* ${filename} */\n${content}</style>`)
      .join('\n');
  }
  
  generateJSIncludes(files) {
    return Object.entries(files)
      .filter(([filename, _]) => filename.endsWith('.js') && !filename.includes('test'))
      .map(([filename, content]) => `<script>/* ${filename} */\n${content}</script>`)
      .join('\n');
  }
  
  transpileReactCode(code) {
    // Basic React code transformation
    return code
      .replace(/export default function (\w+)/g, 'function App')
      .replace(/export default (\w+)/g, 'const App = $1')
      .replace(/import .* from .*/g, '') // Remove imports for preview
      .replace(/export \{[^}]*\}/g, ''); // Remove exports
  }
  
  generateHotReloadScript() {
    if (!this.hotReloadEnabled) return '';
    
    return `
    <script>
      // Hot Reload System
      let lastUpdate = ${this.lastUpdate};
      
      function checkForUpdates() {
        // In a real implementation, this would connect to a WebSocket
        // or poll for file changes
        fetch('/api/preview-status')
          .then(response => response.json())
          .then(data => {
            if (data.lastUpdate > lastUpdate) {
              location.reload();
            }
          })
          .catch(() => {
            // Fallback: check every 2 seconds
            setTimeout(checkForUpdates, 2000);
          });
      }
      
      // Start checking for updates
      setTimeout(checkForUpdates, 1000);
      
      // Visual feedback for hot reload
      window.addEventListener('beforeunload', () => {
        document.body.style.opacity = '0.5';
      });
    </script>`;
  }
  
  // Update preview when files change
  updatePreview(content) {
    this.lastUpdate = Date.now();
    
    if (this.previewIframe) {
      const blob = new Blob([content], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      this.previewIframe.src = url;
      
      // Clean up previous URL
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
    
    return {
      success: true,
      message: 'Preview updated'
    };
  }
  
  // Handle file changes for hot reload
  onFileChange(filename, content) {
    if (!this.isActive) return;
    
    this.currentFiles[filename] = content;
    
    // Debounced update
    clearTimeout(this.updateTimeout);
    this.updateTimeout = setTimeout(() => {
      const previewContent = this.generatePreviewContent(this.currentFiles);
      this.updatePreview(previewContent);
    }, 500);
  }
  
  // Change preview device
  setPreviewDevice(device) {
    this.previewMode = device;
    const preset = this.devicePresets[device];
    
    if (this.previewIframe) {
      this.previewIframe.style.width = preset.width + 'px';
      this.previewIframe.style.height = preset.height + 'px';
    }
    
    return {
      success: true,
      device: preset,
      message: `Preview mode changed to ${preset.name}`
    };
  }
  
  // Setup responsive preview
  setupResponsivePreview() {
    // Initialize with desktop mode
    this.setPreviewDevice('desktop');
  }
  
  // Setup hot reload WebSocket connection
  setupHotReload() {
    // In a real implementation, this would setup WebSocket connection
    // to the development server for instant updates
    this.hotReloadEnabled = true;
  }
  
  // Generate preview URL
  generatePreviewUrl() {
    return `data:text/html;charset=utf-8,${encodeURIComponent(this.generatePreviewContent(this.currentFiles))}`;
  }
  
  // Get preview status
  getStatus() {
    return {
      isActive: this.isActive,
      previewMode: this.previewMode,
      hotReloadEnabled: this.hotReloadEnabled,
      fileCount: Object.keys(this.currentFiles).length,
      lastUpdate: this.lastUpdate,
      devicePreset: this.devicePresets[this.previewMode]
    };
  }
  
  // Toggle hot reload
  toggleHotReload() {
    this.hotReloadEnabled = !this.hotReloadEnabled;
    return {
      success: true,
      enabled: this.hotReloadEnabled,
      message: `Hot reload ${this.hotReloadEnabled ? 'enabled' : 'disabled'}`
    };
  }
}

// Export singleton instance
export const livePreviewManager = new LivePreviewManager();

// Export hook for React components
export function useLivePreview() {
  return {
    startPreview: (files, selectedFile) => 
      livePreviewManager.startPreview(files, selectedFile),
    
    stopPreview: () => 
      livePreviewManager.stopPreview(),
    
    updatePreview: (content) => 
      livePreviewManager.updatePreview(content),
    
    onFileChange: (filename, content) => 
      livePreviewManager.onFileChange(filename, content),
    
    setPreviewDevice: (device) => 
      livePreviewManager.setPreviewDevice(device),
    
    getStatus: () => 
      livePreviewManager.getStatus(),
    
    toggleHotReload: () => 
      livePreviewManager.toggleHotReload(),
    
    getDevicePresets: () => 
      livePreviewManager.devicePresets
  };
}
