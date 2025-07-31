import React, { useState } from 'react';
import {
  HiPlus,
  HiSparkles,
  HiDocument,
  HiFolder,
  HiCommandLine,
  HiMagnifyingGlass,
  HiXMark
} from 'react-icons/hi2';

export default function FloatingActionButton({ onAction, darkMode }) {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { 
      id: 'ai-assist', 
      icon: HiSparkles, 
      label: 'AI Assist',
      color: 'from-purple-500 to-pink-500'
    },
    { 
      id: 'new-file', 
      icon: HiDocument, 
      label: 'New File',
      color: 'from-blue-500 to-cyan-500'
    },
    { 
      id: 'new-folder', 
      icon: HiFolder, 
      label: 'New Folder',
      color: 'from-green-500 to-emerald-500'
    },
    { 
      id: 'terminal', 
      icon: HiCommandLine, 
      label: 'Terminal',
      color: 'from-orange-500 to-red-500'
    },
    { 
      id: 'search', 
      icon: HiMagnifyingGlass, 
      label: 'Search',
      color: 'from-indigo-500 to-purple-500'
    },
  ];

  const handleAction = (actionId) => {
    onAction(actionId);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-20 right-4 lg:bottom-8 lg:right-8 z-40">
      {/* Action buttons */}
      <div className={`absolute bottom-16 right-0 transition-all duration-300 ${
        isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}>
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <div
              key={action.id}
              className={`mb-3 flex items-center justify-end gap-3 transition-all duration-300 ${
                isOpen 
                  ? 'transform translate-x-0 opacity-100' 
                  : 'transform translate-x-4 opacity-0'
              }`}
              style={{
                transitionDelay: isOpen ? `${index * 50}ms` : '0ms'
              }}
            >
              {/* Label */}
              <span className={`text-sm font-medium px-3 py-1 rounded-lg shadow-lg ${
                darkMode 
                  ? 'bg-slate-800 text-white' 
                  : 'bg-white text-gray-900'
              }`}>
                {action.label}
              </span>
              
              {/* Button */}
              <button
                onClick={() => handleAction(action.id)}
                className={`w-12 h-12 rounded-full bg-gradient-to-r ${action.color} 
                  text-white shadow-lg hover:shadow-xl transform hover:scale-110 
                  transition-all duration-200 flex items-center justify-center`}
              >
                <Icon className="w-5 h-5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Main FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-xl hover:shadow-2xl 
          transform transition-all duration-300 flex items-center justify-center
          ${isOpen 
            ? 'rotate-45 bg-gradient-to-r from-red-500 to-pink-500' 
            : 'rotate-0 bg-gradient-to-r from-blue-500 to-purple-500'
          } hover:scale-110`}
      >
        {isOpen ? (
          <HiXMark className="w-6 h-6 text-white" />
        ) : (
          <HiPlus className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 -z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}