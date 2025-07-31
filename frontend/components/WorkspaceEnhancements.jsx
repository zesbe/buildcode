import React, { useState, useEffect } from 'react';
import { 
  HiRectangleStack, 
  HiEye,
  HiEyeSlash,
  HiAdjustmentsHorizontal,
  HiSun,
  HiMoon,
  HiComputerDesktop,
  HiBolt,
  HiSparkles
} from 'react-icons/hi2';

export default function WorkspaceEnhancements({ 
  darkMode, 
  setDarkMode,
  minimap,
  setMinimap,
  wordWrap,
  setWordWrap,
  fontSize,
  setFontSize,
  autoFormat,
  setAutoFormat,
  showNotification 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState('dark');

  const themes = [
    { id: 'dark', name: 'Dark', icon: HiMoon, preview: 'from-slate-900 to-slate-800' },
    { id: 'light', name: 'Light', icon: HiSun, preview: 'from-gray-100 to-white' },
    { id: 'auto', name: 'System', icon: HiComputerDesktop, preview: 'from-blue-900 to-purple-900' }
  ];

  const fontSizes = [10, 12, 14, 16, 18, 20, 24];

  return (
    <div className="relative">
      {/* Settings Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2.5 rounded-xl transition-all duration-300 transform hover:scale-110 ${
          isOpen 
            ? 'bg-purple-500/20 text-purple-400 shadow-purple-500/25 shadow-lg' 
            : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50 hover:text-white'
        }`}
        title="Workspace Settings"
      >
        <HiAdjustmentsHorizontal className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Settings Panel */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-6 w-80 z-50 animate-in slide-in-from-top-2 duration-300">
          
          {/* Theme Selection */}
          <div className="mb-6">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <HiSparkles className="w-4 h-4 text-purple-400" />
              Theme
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {themes.map((themeOption) => (
                <button
                  key={themeOption.id}
                  onClick={() => {
                    setTheme(themeOption.id);
                    if (themeOption.id === 'dark') setDarkMode(true);
                    else if (themeOption.id === 'light') setDarkMode(false);
                    showNotification(`Switched to ${themeOption.name} theme`, 'success');
                  }}
                  className={`p-3 rounded-xl border transition-all duration-200 ${
                    (themeOption.id === 'dark' && darkMode) || 
                    (themeOption.id === 'light' && !darkMode) ||
                    (themeOption.id === theme)
                      ? 'border-purple-500/50 bg-purple-500/10'
                      : 'border-slate-700/50 hover:border-slate-600/50 hover:bg-slate-800/50'
                  }`}
                >
                  <div className={`w-full h-8 rounded-lg bg-gradient-to-r ${themeOption.preview} mb-2`}></div>
                  <div className="flex items-center justify-center gap-1">
                    <themeOption.icon className="w-3 h-3 text-slate-400" />
                    <span className="text-xs text-slate-300">{themeOption.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Editor Settings */}
          <div className="mb-6">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <HiBolt className="w-4 h-4 text-blue-400" />
              Editor
            </h3>
            
            {/* Font Size */}
            <div className="mb-4">
              <label className="block text-sm text-slate-300 mb-2">Font Size</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="10"
                  max="24"
                  step="2"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm text-slate-400 w-8 text-center">{fontSize}px</span>
              </div>
            </div>

            {/* Toggle Settings */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HiRectangleStack className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-300">Minimap</span>
                </div>
                <button
                  onClick={() => {
                    setMinimap(!minimap);
                    showNotification(`Minimap ${!minimap ? 'enabled' : 'disabled'}`, 'info');
                  }}
                  className={`w-11 h-6 rounded-full transition-all duration-200 ${
                    minimap ? 'bg-blue-600' : 'bg-slate-700'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                    minimap ? 'translate-x-6' : 'translate-x-1'
                  }`}></div>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {wordWrap ? <HiEye className="w-4 h-4 text-slate-400" /> : <HiEyeSlash className="w-4 h-4 text-slate-400" />}
                  <span className="text-sm text-slate-300">Word Wrap</span>
                </div>
                <button
                  onClick={() => {
                    setWordWrap(!wordWrap);
                    showNotification(`Word wrap ${!wordWrap ? 'enabled' : 'disabled'}`, 'info');
                  }}
                  className={`w-11 h-6 rounded-full transition-all duration-200 ${
                    wordWrap ? 'bg-green-600' : 'bg-slate-700'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                    wordWrap ? 'translate-x-6' : 'translate-x-1'
                  }`}></div>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HiSparkles className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-300">Auto Format</span>
                </div>
                <button
                  onClick={() => {
                    setAutoFormat(!autoFormat);
                    showNotification(`Auto format ${!autoFormat ? 'enabled' : 'disabled'}`, 'info');
                  }}
                  className={`w-11 h-6 rounded-full transition-all duration-200 ${
                    autoFormat ? 'bg-purple-600' : 'bg-slate-700'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                    autoFormat ? 'translate-x-6' : 'translate-x-1'
                  }`}></div>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="border-t border-slate-700/50 pt-4">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  // Reset to defaults
                  setFontSize(14);
                  setMinimap(true);
                  setWordWrap(true);
                  setAutoFormat(true);
                  showNotification('Settings reset to defaults', 'success');
                }}
                className="px-3 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-lg text-xs transition-colors"
              >
                Reset Defaults
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  showNotification('Settings saved', 'success');
                }}
                className="px-3 py-2 bg-blue-600/80 hover:bg-blue-600 text-white rounded-lg text-xs transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}