import React, { useState, useEffect } from 'react';
import { 
  HiPlay,
  HiStop,
  HiArrowPath,
  HiMagnifyingGlass,
  HiCodeBracket,
  HiDocumentDuplicate,
  HiBolt,
  HiEye,
  HiEyeSlash
} from 'react-icons/hi2';

export default function FloatingToolbar({ 
  selected,
  files,
  onRunCode,
  onFormatCode,
  onDuplicateFile,
  onSearch,
  showPreview,
  setShowPreview,
  isRunning,
  setIsRunning,
  showNotification
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Show toolbar when file is selected
  useEffect(() => {
    setIsVisible(!!selected);
  }, [selected]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  const canRun = selected && /\\.(js|jsx|ts|tsx|html)$/.test(selected);
  const canFormat = selected && /\\.(js|jsx|ts|tsx|json|css|html|md)$/.test(selected);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed z-50 select-none"
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        transform: isDragging ? 'scale(1.05)' : 'scale(1)',
        transition: isDragging ? 'none' : 'transform 0.2s ease'
      }}
    >
      <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-2">
        {/* Drag Handle */}
        <div 
          className="flex items-center justify-center py-1 cursor-move hover:bg-slate-700/50 rounded-lg mb-1"
          onMouseDown={handleMouseDown}
        >
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
            <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
            <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
          </div>
        </div>

        {/* Toolbar Actions */}
        <div className="flex items-center gap-1">
          {/* Run/Stop Code */}
          {canRun && (
            <button
              onClick={() => {
                if (isRunning) {
                  setIsRunning(false);
                  showNotification('Stopped execution', 'info');
                } else {
                  onRunCode();
                  setIsRunning(true);
                  showNotification('Running code...', 'info');
                }
              }}
              className={`p-2 rounded-lg transition-all transform hover:scale-110 ${
                isRunning 
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                  : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
              }`}
              title={isRunning ? 'Stop Execution' : 'Run Code'}
            >
              {isRunning ? <HiStop className="w-4 h-4" /> : <HiPlay className="w-4 h-4" />}
            </button>
          )}

          {/* Format Code */}
          {canFormat && (
            <button
              onClick={() => {
                onFormatCode();
                showNotification('Code formatted', 'success');
              }}
              className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all transform hover:scale-110"
              title="Format Code"
            >
              <HiCodeBracket className="w-4 h-4" />
            </button>
          )}

          {/* Duplicate File */}
          <button
            onClick={() => {
              onDuplicateFile();
              showNotification(`Duplicated ${selected}`, 'success');
            }}
            className="p-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-all transform hover:scale-110"
            title="Duplicate File"
          >
            <HiDocumentDuplicate className="w-4 h-4" />
          </button>

          {/* Search in File */}
          <button
            onClick={() => {
              onSearch();
              showNotification('Search activated', 'info');
            }}
            className="p-2 rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-all transform hover:scale-110"
            title="Search in File"
          >
            <HiMagnifyingGlass className="w-4 h-4" />
          </button>

          {/* Toggle Preview */}
          <button
            onClick={() => {
              setShowPreview(!showPreview);
              showNotification(`Preview ${!showPreview ? 'enabled' : 'disabled'}`, 'info');
            }}
            className={`p-2 rounded-lg transition-all transform hover:scale-110 ${
              showPreview 
                ? 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30'
                : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50'
            }`}
            title="Toggle Preview"
          >
            {showPreview ? <HiEye className="w-4 h-4" /> : <HiEyeSlash className="w-4 h-4" />}
          </button>

          {/* Quick Actions */}
          <div className="w-px h-6 bg-slate-700/50 mx-1"></div>
          
          {/* Auto Actions */}
          <button
            onClick={() => {
              // Auto-save all
              showNotification('Force saving all files...', 'info');
            }}
            className="p-2 rounded-lg bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-all transform hover:scale-110"
            title="Auto Actions"
          >
            <HiBolt className="w-4 h-4" />
          </button>

          {/* Refresh */}
          <button
            onClick={() => {
              // Refresh current file or reload
              window.location.reload();
            }}
            className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-all transform hover:scale-110"
            title="Refresh"
          >
            <HiArrowPath className="w-4 h-4" />
          </button>
        </div>

        {/* File Info */}
        <div className="mt-2 pt-2 border-t border-slate-700/50">
          <div className="text-xs text-slate-400 text-center truncate max-w-48">
            {selected}
          </div>
        </div>
      </div>
    </div>
  );
}