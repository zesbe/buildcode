import React, { useState } from 'react';
import { 
  HiCommandLine,
  HiMagnifyingGlass, 
  HiDocumentDuplicate,
  HiFolderPlus,
  HiDocumentPlus,
  HiArrowDownTray,
  HiArrowUpTray,
  HiCodeBracket,
  HiPlayCircle,
  HiStopCircle
} from 'react-icons/hi2';

export default function QuickActions({ 
  files, 
  selected, 
  onFileAdd, 
  onFolderAdd, 
  onDownload,
  onUpload,
  showNotification,
  onRunCode,
  onFormatCode 
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const quickActions = [
    {
      id: 'new-file',
      label: 'New File',
      icon: HiDocumentPlus,
      action: () => onFileAdd(),
      shortcut: 'Ctrl+N',
      color: 'blue'
    },
    {
      id: 'new-folder',
      label: 'New Folder',
      icon: HiFolderPlus,
      action: () => onFolderAdd(),
      shortcut: 'Ctrl+Shift+F',
      color: 'green'
    },
    {
      id: 'duplicate-file',
      label: 'Duplicate',
      icon: HiDocumentDuplicate,
      action: () => {
        if (selected) {
          const newName = selected.replace(/(\.[^.]+)?$/, '-copy$1');
          onFileAdd(newName);
          showNotification(`Duplicated ${selected}`, 'success');
        }
      },
      shortcut: 'Ctrl+D',
      color: 'purple',
      disabled: !selected
    },
    {
      id: 'download',
      label: 'Download',
      icon: HiArrowDownTray,
      action: onDownload,
      shortcut: 'Ctrl+S',
      color: 'indigo',
      disabled: !selected
    },
    {
      id: 'upload',
      label: 'Upload',
      icon: HiArrowUpTray,
      action: onUpload,
      shortcut: 'Ctrl+U',
      color: 'pink'
    },
    {
      id: 'format',
      label: 'Format Code',
      icon: HiCodeBracket,
      action: onFormatCode,
      shortcut: 'Shift+Alt+F',
      color: 'yellow',
      disabled: !selected
    },
    {
      id: 'run',
      label: 'Run Code',
      icon: HiPlayCircle,
      action: onRunCode,
      shortcut: 'F5',
      color: 'emerald',
      disabled: !selected || !selected.match(/\\.(js|jsx|ts|tsx|html)$/)
    }
  ];

  return (
    <div className="relative">
      {/* Quick Actions Trigger */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600/80 to-purple-600/80 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-medium text-sm transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${
          isExpanded ? 'shadow-2xl scale-105' : ''
        }`}
      >
        <HiCommandLine className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
        <span>Quick Actions</span>
        <div className="flex -space-x-1">
          <div className="w-2 h-2 bg-white/40 rounded-full group-hover:bg-white/60 transition-colors"></div>
          <div className="w-2 h-2 bg-white/60 rounded-full group-hover:bg-white/80 transition-colors"></div>
          <div className="w-2 h-2 bg-white/80 rounded-full group-hover:bg-white transition-colors"></div>
        </div>
      </button>

      {/* Actions Panel */}
      {isExpanded && (
        <div className="absolute top-full left-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-4 min-w-80 z-50 animate-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => {
                  if (!action.disabled) {
                    action.action();
                    setIsExpanded(false);
                  }
                }}
                disabled={action.disabled}
                className={`group flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                  action.disabled 
                    ? 'opacity-50 cursor-not-allowed bg-slate-800/30'
                    : `hover:bg-${action.color}-500/10 hover:border-${action.color}-500/30 border border-transparent hover:scale-102 transform`
                }`}
              >
                <div className={`p-2 rounded-lg ${
                  action.disabled 
                    ? 'bg-slate-700/50'
                    : `bg-${action.color}-500/20 group-hover:bg-${action.color}-500/30 transition-colors`
                }`}>
                  <action.icon className={`w-4 h-4 ${
                    action.disabled 
                      ? 'text-slate-500'
                      : `text-${action.color}-400 group-hover:text-${action.color}-300`
                  }`} />
                </div>
                <div className="flex-1 text-left">
                  <div className={`font-medium text-sm ${
                    action.disabled ? 'text-slate-500' : 'text-white'
                  }`}>
                    {action.label}
                  </div>
                  <div className="text-xs text-slate-500">
                    {action.shortcut}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Command Palette Hint */}
          <div className="mt-4 pt-3 border-t border-slate-700/50">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <HiMagnifyingGlass className="w-3 h-3" />
              <span>Press <kbd className="px-1.5 py-0.5 bg-slate-700/50 rounded text-slate-300">Ctrl+P</kbd> for command palette</span>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isExpanded && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
}

// Keyboard shortcut helper component
export function KeyboardShortcutsHelp({ isOpen, onClose }) {
  const shortcuts = [
    { key: 'Ctrl + N', action: 'New File' },
    { key: 'Ctrl + Shift + N', action: 'New Folder' },
    { key: 'Ctrl + D', action: 'Duplicate File' },
    { key: 'Ctrl + S', action: 'Download File' },
    { key: 'Ctrl + U', action: 'Upload Files' },
    { key: 'Ctrl + P', action: 'Command Palette' },
    { key: 'Ctrl + B', action: 'Toggle Sidebar' },
    { key: 'Ctrl + 1/2/3', action: 'Switch Panels' },
    { key: 'Shift + Alt + F', action: 'Format Code' },
    { key: 'F5', action: 'Run Code' },
    { key: 'Ctrl + /', action: 'Toggle Comment' },
    { key: 'Alt + ↑/↓', action: 'Move Line Up/Down' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Keyboard Shortcuts</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-700 text-slate-400 hover:text-white rounded transition-colors"
            >
              ×
            </button>
          </div>
        </div>
        <div className="p-6 max-h-96 overflow-y-auto">
          <div className="space-y-3">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <span className="text-slate-300 text-sm">{shortcut.action}</span>
                <kbd className="px-2 py-1 bg-slate-800 text-slate-300 rounded text-xs font-mono">
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}