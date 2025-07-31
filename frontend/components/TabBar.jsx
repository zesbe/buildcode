import React, { useRef, useEffect } from 'react';
import { HiXMark, HiDocument, HiCodeBracket, HiPhoto, HiCog6Tooth } from 'react-icons/hi2';
import '../utils/suppressResizeObserverErrors';

function getFileIcon(filename) {
  const ext = filename.split('.').pop()?.toLowerCase();
  
  const iconMap = {
    'tsx': { icon: HiCodeBracket, color: 'text-blue-500' },
    'ts': { icon: HiCodeBracket, color: 'text-blue-600' },
    'jsx': { icon: HiCodeBracket, color: 'text-cyan-500' },
    'js': { icon: HiCodeBracket, color: 'text-yellow-500' },
    'css': { icon: HiCodeBracket, color: 'text-blue-400' },
    'scss': { icon: HiCodeBracket, color: 'text-pink-500' },
    'html': { icon: HiCodeBracket, color: 'text-orange-500' },
    'json': { icon: HiCog6Tooth, color: 'text-green-500' },
    'md': { icon: HiDocument, color: 'text-slate-400' },
    'png': { icon: HiPhoto, color: 'text-purple-400' },
    'jpg': { icon: HiPhoto, color: 'text-purple-400' },
    'jpeg': { icon: HiPhoto, color: 'text-purple-400' },
    'gif': { icon: HiPhoto, color: 'text-purple-400' },
    'svg': { icon: HiPhoto, color: 'text-green-400' }
  };

  return iconMap[ext] || { icon: HiDocument, color: 'text-slate-400' };
}

export default function TabBar({ openTabs, selectedTab, onTabSelect, onTabClose, files }) {
  const tabBarRef = useRef(null);

  useEffect(() => {
    // Simple overflow handling without ResizeObserver
    const handleOverflow = () => {
      if (tabBarRef.current) {
        const scrollWidth = tabBarRef.current.scrollWidth;
        const clientWidth = tabBarRef.current.clientWidth;

        // Add scroll indicators if needed
        const hasOverflow = scrollWidth > clientWidth;
        if (hasOverflow) {
          tabBarRef.current.style.maskImage =
            'linear-gradient(to right, transparent, black 20px, black calc(100% - 20px), transparent)';
        } else {
          tabBarRef.current.style.maskImage = 'none';
        }
      }
    };

    // Check overflow after tabs change
    const timeoutId = setTimeout(handleOverflow, 100);

    return () => clearTimeout(timeoutId);
  }, [openTabs.length]);

  if (openTabs.length === 0) return null;

  return (
    <div
      ref={tabBarRef}
      className="flex items-center bg-slate-800/50 border-b border-slate-700/50 overflow-x-auto">
      {openTabs.map((tab) => {
        const { icon: IconComponent, color } = getFileIcon(tab);
        const isSelected = tab === selectedTab;
        const hasChanges = false; // TODO: implement unsaved changes detection
        
        return (
          <div
            key={tab}
            className={`flex items-center gap-2 px-3 py-2 border-r border-slate-700/50 min-w-fit cursor-pointer transition-colors ${
              isSelected 
                ? 'bg-slate-700/50 text-white' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'
            }`}
            onClick={() => onTabSelect(tab)}
          >
            <IconComponent className={`w-4 h-4 ${isSelected ? color : 'text-slate-500'}`} />
            <span className="text-sm font-mono truncate max-w-[120px]">
              {tab.split('/').pop()}
            </span>
            {hasChanges && (
              <div className="w-1.5 h-1.5 bg-orange-400 rounded-full" title="Unsaved changes" />
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tab);
              }}
              className="p-0.5 text-slate-500 hover:text-red-400 hover:bg-red-500/20 rounded transition-colors"
              title="Close tab"
            >
              <HiXMark className="w-3 h-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
