import React, { useRef } from 'react';
import { HiArrowUpTray, HiDocument } from 'react-icons/hi2';

export default function FileUpload({ onFileUpload, showNotification }) {
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target.result;
        const fileName = file.name;
        
        // Call parent callback
        onFileUpload(fileName, content);
        showNotification(`File "${fileName}" uploaded successfully!`, 'success');
      };
      
      reader.onerror = () => {
        showNotification(`Error reading file "${file.name}"`, 'error');
      };
      
      reader.readAsText(file);
    });
    
    // Reset input
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target.result;
        const fileName = file.name;
        onFileUpload(fileName, content);
        showNotification(`File "${fileName}" dropped and uploaded!`, 'success');
      };
      reader.readAsText(file);
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".js,.jsx,.ts,.tsx,.py,.html,.css,.json,.md,.txt"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {/* Upload button */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="p-2 text-slate-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-all"
        title="Upload Files"
      >
        <HiArrowUpTray className="w-4 h-4" />
      </button>
      
      {/* Drop zone (invisible overlay) */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="fixed inset-0 pointer-events-none z-40"
      />
    </div>
  );
}