import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import FileExplorer from "../components/FileExplorer";
import EditorPanel from "../components/EditorPanel";
import EnhancedEditorPanel from "../components/EnhancedEditorPanel";
import ModernChat from "../components/ModernChat";
import NotificationPanel from "../components/NotificationPanel";
import TabBar from "../components/TabBar";
import PackageManager from "../components/PackageManager";
import LivePreview from "../components/LivePreview";
import FileUpload from "../components/FileUpload";
import ChatHistory from "../components/ChatHistory";

// Dynamic import to prevent SSR issues
const CodeRunner = dynamic(() => import("../components/CodeRunner"), {
  ssr: false,
  loading: () => <div className="p-4 text-center text-slate-400">Loading Code Runner...</div>
});
const SmartPackageManager = dynamic(() => import("../components/SmartPackageManager"), {
  ssr: false,
  loading: () => <div className="p-4 text-center text-slate-400">Loading Package Manager...</div>
});
const WebInspector = dynamic(() => import("../components/WebInspector"), {
  ssr: false,
  loading: () => <div className="p-4 text-center text-slate-400">Loading Web Inspector...</div>
});
// import CommandPalette from "../components/CommandPalette";
import { parseAICommand, executeAICommands } from "../utils/aiFileActions";
import { smartFileCreation } from "../utils/advancedFileOperations";
import { useAutoSave } from "../utils/autoSave";
import { downloadFile, downloadProjectAsZip } from "../utils/fileDownload";
import { createProjectFromTemplate, templates } from "../utils/projectTemplates";
import "../utils/suppressResizeObserverErrors";
import {
  HiCodeBracket,
  HiFolderOpen,
  HiCommandLine,
  HiSparkles,
  HiCog6Tooth,
  HiPlay,
  HiStop,
  HiArrowPath,
  HiSquares2X2,
  HiCube,
  HiEye,
  HiMoon,
  HiSun,
  HiDocumentText,
  HiMagnifyingGlass,
  HiOutlineSparkles,
  HiBolt,
  HiCheck,
  HiArrowDownTray,
  HiArrowUpTray,
  HiSquares2X2 as HiTemplate,
  HiRocketLaunch,
  HiChatBubbleLeftEllipsis
} from "react-icons/hi2";
import { chatStorage } from "../utils/chatStorage";

const defaultFiles = {
  "README.md": "# 🚀 Claude 4 Codespace - AI-Powered Development\n\n## Features\n- 🤖 **AI-First Development** with Claude 4\n- ⚡ **Auto Code Generation** \n- 🔍 **Real-time Analysis**\n- 📱 **Mobile-First Design**\n- 💻 **VSCode-like Experience**\n\n## Quick Start\n1. Select a file from the Files panel\n2. Start coding with AI assistance\n3. Use Terminal for advanced commands\n4. Everything auto-saves and syncs\n\n**Status:** ✅ Ready for development",
  "components/App.tsx": "import React from 'react';\n\ninterface AppProps {\n  title: string;\n}\n\nexport default function App({ title }: AppProps) {\n  return (\n    <div className=\"min-h-screen bg-gray-100\">\n      <header className=\"bg-white shadow-sm\">\n        <h1 className=\"text-2xl font-bold text-gray-900 p-4\">\n          {title}\n        </h1>\n      </header>\n      <main className=\"container mx-auto p-4\">\n        <p className=\"text-gray-600\">Welcome to your app!</p>\n      </main>\n    </div>\n  );\n}",
  "utils/helpers.ts": "export function formatDate(date: Date): string {\n  return date.toLocaleDateString('en-US', {\n    year: 'numeric',\n    month: 'long',\n    day: 'numeric'\n  });\n}\n\nexport function capitalize(str: string): string {\n  return str.charAt(0).toUpperCase() + str.slice(1);\n}"
};

export default function ModernCodespace() {
  const [files, setFiles] = useState(defaultFiles);
  const [folders, setFolders] = useState(['components', 'utils']);
  const [expandedFolders, setExpandedFolders] = useState(['components']);
  const [selected, setSelected] = useState("README.md");
  const [openTabs, setOpenTabs] = useState(["README.md"]);
  const [notifications, setNotifications] = useState([]);
  const [activePanel, setActivePanel] = useState('files'); // 'files', 'editor', 'terminal'
  const [enhancedEditorEnabled, setEnhancedEditorEnabled] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showPackageManager, setShowPackageManager] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [autoFormat, setAutoFormat] = useState(true);
  const [minimap, setMinimap] = useState(true);
  const [wordWrap, setWordWrap] = useState(true);
  const [fontSize, setFontSize] = useState(14);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showCodeRunner, setShowCodeRunner] = useState(false);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [showSmartPackageManager, setShowSmartPackageManager] = useState(false);
  const [showWebInspector, setShowWebInspector] = useState(false);
  const [currentChatSession, setCurrentChatSession] = useState(null);

  // Initialize auto-save functionality
  const { queueFileChange, saveSession, restoreSession, getSaveStatus, clearSession } = useAutoSave(
    files, setFiles, setSelected, openTabs, setOpenTabs,
    folders, setFolders, expandedFolders, setExpandedFolders,
    activePanel, enhancedEditorEnabled
  );

  // Make chat history accessible from ModernChat
  useEffect(() => {
    window.showChatHistory = () => setShowChatHistory(true);
    return () => {
      delete window.showChatHistory;
    };
  }, []);

  // Restore session on mount
  useEffect(() => {
    const restored = restoreSession();
    if (restored) {
      showNotification('Session restored! 🔄', 'success');
    }
    
    // Initialize chat session
    const sessionId = chatStorage.getCurrentSessionId();
    setCurrentChatSession(sessionId);
    
    // Restore user preferences
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) setDarkMode(JSON.parse(savedDarkMode));
    
    const savedAutoFormat = localStorage.getItem('autoFormat');
    if (savedAutoFormat !== null) setAutoFormat(JSON.parse(savedAutoFormat));
    
    const savedFontSize = localStorage.getItem('fontSize');
    if (savedFontSize !== null) setFontSize(parseInt(savedFontSize));
  }, []);

  // Save preferences
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('autoFormat', JSON.stringify(autoFormat));
  }, [autoFormat]);

  useEffect(() => {
    localStorage.setItem('fontSize', JSON.stringify(fontSize));
  }, [fontSize]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      // Save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        showNotification('Auto-save is always active! ✅', 'success');
      }
      // Toggle sidebar
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        setSidebarCollapsed(prev => !prev);
      }
      // Quick switch panels
      if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '4') {
        e.preventDefault();
        const panels = ['files', 'editor', 'terminal'];
        setActivePanel(panels[parseInt(e.key) - 1]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-save session state changes
  useEffect(() => {
    saveSession();
  }, [files, openTabs, selected, folders, expandedFolders, activePanel, enhancedEditorEnabled]);

  function showNotification(message, type = 'info') {
    const id = Date.now();
    const notification = { id, message, type };
    setNotifications(prev => [...prev, notification]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  }

  function handleClaudeAction(text) {
    const commands = parseAICommand(text, files);
    if (commands.length > 0) {
      executeAICommands(commands, files, setFiles, setSelected, showNotification, folders, setFolders, setOpenTabs);
    }
  }

  function handleFileSelect(name) {
    setSelected(name);
    // Add to open tabs if not already open
    if (!openTabs.includes(name)) {
      setOpenTabs(prev => [...prev, name]);
    }
    if (window.innerWidth < 768) {
      setActivePanel('editor');
    }
  }

  function handleTabClose(tabName) {
    const newTabs = openTabs.filter(tab => tab !== tabName);
    setOpenTabs(newTabs);

    // If closing the selected tab, switch to another tab
    if (selected === tabName) {
      if (newTabs.length > 0) {
        setSelected(newTabs[newTabs.length - 1]);
      } else {
        setSelected(null);
      }
    }
  }

  function handleTabSelect(tabName) {
    setSelected(tabName);
  }

  function handleFileAdd(name, folder = null) {
    try {
      let finalName = name || prompt("File name:");
      if (!finalName || !finalName.trim()) return;

      finalName = finalName.trim();

      // Validate filename
      if (!/^[a-zA-Z0-9_.-]+$/.test(finalName)) {
        showNotification("File name can only contain letters, numbers, underscores, dots, and hyphens", 'error');
        return;
      }

      if (folder) finalName = `${folder}/${finalName}`;

      if (files[finalName]) {
        showNotification("File already exists!", 'error');
        return;
      }

      smartFileCreation(finalName, files, setFiles, setSelected, showNotification, setOpenTabs);
      if (folder && !expandedFolders.includes(folder)) {
        setExpandedFolders(prev => [...prev, folder]);
      }
    } catch (error) {
      showNotification("Failed to create file", 'error');
    }
  }

  function handleFileDelete(name) {
    try {
      if (!name) {
        showNotification("No file specified for deletion", 'error');
        return;
      }

      if (name.startsWith('folder:')) {
        const folderName = name.replace('folder:', '');
        const filesToDelete = Object.keys(files).filter(f => f.startsWith(`${folderName}/`));

        if (filesToDelete.length > 0) {
          const confirmDelete = window.confirm(`This will delete ${filesToDelete.length} files in "${folderName}". Continue?`);
          if (!confirmDelete) return;
        }

        const newFiles = { ...files };
        filesToDelete.forEach(f => delete newFiles[f]);
        setFiles(newFiles);
        setFolders(prev => prev.filter(f => f !== folderName));
        setExpandedFolders(prev => prev.filter(f => f !== folderName));
        setOpenTabs(prev => prev.filter(tab => !tab.startsWith(`${folderName}/`)));

        if (selected && selected.startsWith(`${folderName}/`)) {
          const remainingFiles = Object.keys(newFiles);
          setSelected(remainingFiles.length > 0 ? remainingFiles[0] : null);
        }

        showNotification(`Folder "${folderName}" deleted`, 'success');
      } else {
        if (Object.keys(files).length === 1) {
          showNotification("Cannot delete the last file!", 'error');
          return;
        }

        if (!files[name]) {
          showNotification(`File "${name}" not found`, 'error');
          return;
        }

        const { [name]: _, ...rest } = files;
        setFiles(rest);
        setOpenTabs(prev => prev.filter(tab => tab !== name));
        setSelected(selected === name ? Object.keys(rest)[0] : selected);
        showNotification(`File "${name}" deleted`, 'success');
      }
    } catch (error) {
      showNotification("Failed to delete file/folder", 'error');
    }
  }

  function handleFileRename(oldName, newName) {
    if (files[oldName] && !files[newName]) {
      const { [oldName]: content, ...rest } = files;
      setFiles({ ...rest, [newName]: content });
      if (selected === oldName) setSelected(newName);
      showNotification(`Renamed "${oldName}" to "${newName}"`, 'success');
    } else {
      showNotification('File with new name already exists or invalid name', 'error');
    }
  }

  function handleFileDuplicate(originalName, newName) {
    if (files[originalName] && !files[newName]) {
      setFiles(prev => ({ ...prev, [newName]: prev[originalName] }));
      showNotification(`Duplicated "${originalName}" as "${newName}"`, 'success');
    } else {
      showNotification('File with new name already exists or invalid name', 'error');
    }
  }

  function handleAddFolder(folderName) {
    if (folders.includes(folderName)) {
      showNotification('Folder already exists!', 'error');
      return;
    }

    // Handle nested folders
    const parts = folderName.split('/');
    const newFolders = [];

    // Create all parent folders if they don't exist
    for (let i = 0; i < parts.length; i++) {
      const currentPath = parts.slice(0, i + 1).join('/');
      if (!folders.includes(currentPath)) {
        newFolders.push(currentPath);
      }
    }

    if (newFolders.length > 0) {
      setFolders(prev => [...prev, ...newFolders].sort());
      setExpandedFolders(prev => [...prev, ...newFolders]);
      showNotification(`Folder "${folderName}" created`, 'success');
    }
  }

  function handleToggleFolder(folderName) {
    setExpandedFolders(prev =>
      prev.includes(folderName)
        ? prev.filter(f => f !== folderName)
        : [...prev, folderName]
    );
  }

  function handleFileEdit(value) {
    if (selected) {
      setFiles(f => ({ ...f, [selected]: value }));
      // Queue for auto-save
      queueFileChange(selected, value);
    }
  }

  // Chat session handlers
  function handleSwitchChatSession(sessionId) {
    setCurrentChatSession(sessionId);
    // The ModernChat component will handle loading the chat history
    showNotification('Switched to chat session', 'success');
  }

  const getLang = (fname) => {
    if (!fname) return "plaintext";
    return fname.endsWith(".js") ? "javascript" :
           fname.endsWith(".jsx") ? "javascript" :
           fname.endsWith(".ts") ? "typescript" :
           fname.endsWith(".tsx") ? "typescript" :
           fname.endsWith(".md") ? "markdown" :
           fname.endsWith(".py") ? "python" :
           fname.endsWith(".json") ? "json" :
           fname.endsWith(".css") ? "css" :
           fname.endsWith(".html") ? "html" :
           "plaintext";
  };

  // Advanced feature handlers
  function handleFileUpload(filename, content) {
    setFiles(prev => ({ ...prev, [filename]: content }));
    
    // Add to open tabs if not already open
    if (!openTabs.includes(filename)) {
      setOpenTabs(prev => [...prev, filename]);
    }
    
    // Select the uploaded file
    setSelected(filename);
    
    // Add folder if file is in a folder
    const folderPath = filename.split('/');
    if (folderPath.length > 1) {
      const folder = folderPath.slice(0, -1).join('/');
      if (!folders.includes(folder)) {
        setFolders(prev => [...prev, folder].sort());
        setExpandedFolders(prev => [...prev, folder]);
      }
    }
  }

  function handleDownloadFile() {
    if (!selected || !files[selected]) {
      showNotification('No file selected to download', 'error');
      return;
    }
    
    downloadFile(selected, files[selected]);
    showNotification(`Downloaded ${selected}`, 'success');
  }

  function handleDownloadProject() {
    downloadProjectAsZip(files, folders, 'claude-project');
    showNotification('Project exported successfully!', 'success');
  }

  function handleLoadTemplate(templateKey) {
    try {
      const template = createProjectFromTemplate(templateKey);
      
      // Confirm before replacing current project
      const confirmReplace = window.confirm(
        `This will replace your current project with "${template.name}". Continue?`
      );
      
      if (!confirmReplace) return;
      
      // Load template
      setFiles(template.files);
      setFolders(template.folders);
      setExpandedFolders(template.folders);
      
      // Select first file
      const firstFile = Object.keys(template.files)[0];
      setSelected(firstFile);
      setOpenTabs([firstFile]);
      
      setShowTemplates(false);
      showNotification(`Template "${template.name}" loaded successfully!`, 'success');
      
    } catch (error) {
      showNotification(`Error loading template: ${error.message}`, 'error');
    }
  }

  return (
    <div className={`h-screen w-screen ${darkMode ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'} flex flex-col overflow-hidden transition-colors duration-300`}>
      {/* Modern Header with Glass Effect */}
      <div className={`h-14 ${darkMode ? 'bg-slate-900/80' : 'bg-white/80'} backdrop-blur-xl border-b ${darkMode ? 'border-slate-700/50' : 'border-gray-200'} flex items-center px-3 md:px-4 shadow-lg relative z-50`}>
        <div className="flex items-center gap-2 md:gap-3">
          {/* Logo with Animation */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-lg group-hover:blur-xl transition-all opacity-50"></div>
            <div className="relative w-9 h-9 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
              <HiCodeBracket className="text-white w-5 h-5" />
            </div>
          </div>
          <div className="hidden sm:block">
            <h1 className={`${darkMode ? 'text-white' : 'text-gray-900'} font-bold text-base`}>Claude 4 Studio</h1>
            <p className={`${darkMode ? 'text-slate-400' : 'text-gray-500'} text-xs`}>Next-Gen AI Coding</p>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="flex-1 flex items-center justify-center gap-2 px-2">
          <div className={`flex items-center gap-0.5 ${darkMode ? 'bg-slate-800/50' : 'bg-gray-100'} rounded-xl p-1 shadow-inner`}>
            {/* Command Palette */}
            <button
              onClick={() => setShowCommandPalette(true)}
              className={`p-2 ${darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-700/50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'} rounded-lg transition-all group`}
              title="Command Palette (Ctrl+P)"
            >
              <HiMagnifyingGlass className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>
            
            <div className={`w-px h-5 ${darkMode ? 'bg-slate-700' : 'bg-gray-300'} mx-1`} />
            
            <button
              onClick={() => setShowSmartPackageManager(true)}
              className={`p-2 ${darkMode ? 'text-slate-400 hover:text-purple-400 hover:bg-purple-500/10' : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'} rounded-lg transition-all`}
              title="Smart Package Manager"
            >
              <HiCube className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowLivePreview(true)}
              className={`p-2 ${darkMode ? 'text-slate-400 hover:text-blue-400 hover:bg-blue-500/10' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'} rounded-lg transition-all`}
              title="Live Preview"
            >
              <HiEye className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setShowCodeRunner(!showCodeRunner)}
              className={`p-2 ${showCodeRunner ? (darkMode ? 'text-green-400 bg-green-500/10' : 'text-green-600 bg-green-50') : (darkMode ? 'text-slate-400 hover:text-green-400 hover:bg-green-500/10' : 'text-gray-600 hover:text-green-600 hover:bg-green-50')} rounded-lg transition-all`}
              title="Code Runner"
            >
              <HiPlay className="w-4 h-4" />
            </button>
            
            {/* Chat History */}
            <button
              onClick={() => setShowChatHistory(true)}
              className={`p-2 ${darkMode ? 'text-slate-400 hover:text-blue-400 hover:bg-blue-500/10' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'} rounded-lg transition-all`}
              title="Chat History"
            >
              <HiChatBubbleLeftEllipsis className="w-4 h-4" />
            </button>
            
            {/* Web Inspector */}
            <button
              onClick={() => setShowWebInspector(true)}
              className={`p-2 ${darkMode ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/10' : 'text-gray-600 hover:text-red-600 hover:bg-red-50'} rounded-lg transition-all`}
              title="Web Inspector"
            >
              <HiCodeBracket className="w-4 h-4" />
            </button>
            
            <div className={`w-px h-5 ${darkMode ? 'bg-slate-700' : 'bg-gray-300'} mx-1`} />
            
            {/* File Upload */}
            <FileUpload
              onFileUpload={handleFileUpload}
              showNotification={showNotification}
            />
            
            {/* Download Actions */}
            <button
              onClick={handleDownloadFile}
              disabled={!selected}
              className={`p-2 ${darkMode ? 'text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 disabled:opacity-50' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-50'} rounded-lg transition-all`}
              title="Download Current File"
            >
              <HiArrowDownTray className="w-4 h-4" />
            </button>
            
            {/* Templates */}
            <button
              onClick={() => setShowTemplates(true)}
              className={`p-2 ${darkMode ? 'text-slate-400 hover:text-orange-400 hover:bg-orange-500/10' : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'} rounded-lg transition-all`}
              title="Project Templates"
            >
              <HiTemplate className="w-4 h-4" />
            </button>
            
            <div className={`w-px h-5 ${darkMode ? 'bg-slate-700' : 'bg-gray-300'} mx-1`} />
            
            {/* Format Button */}
            <button
              onClick={() => {
                setAutoFormat(!autoFormat);
                showNotification(autoFormat ? 'Auto-format disabled' : 'Auto-format enabled', 'info');
              }}
              className={`p-2 ${autoFormat ? (darkMode ? 'text-green-400 bg-green-500/10' : 'text-green-600 bg-green-50') : (darkMode ? 'text-slate-400' : 'text-gray-600')} rounded-lg transition-all`}
              title="Auto Format"
            >
              <HiDocumentText className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* AI Toggle with Better Visual */}
          <button
            onClick={() => setEnhancedEditorEnabled(!enhancedEditorEnabled)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-all transform hover:scale-105 ${
              enhancedEditorEnabled
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                : darkMode ? 'bg-slate-700/50 text-slate-400 hover:text-white' : 'bg-gray-200 text-gray-600 hover:text-gray-900'
            }`}
          >
            <HiSparkles className={`w-4 h-4 ${enhancedEditorEnabled ? 'animate-pulse' : ''}`} />
            <span className="hidden md:inline">AI {enhancedEditorEnabled ? 'On' : 'Off'}</span>
          </button>
          
          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-xl transition-all transform hover:scale-110 ${
              darkMode 
                ? 'bg-slate-700/50 text-yellow-400 hover:bg-slate-700' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            title="Toggle Theme"
          >
            {darkMode ? <HiSun className="w-4 h-4" /> : <HiMoon className="w-4 h-4" />}
          </button>
          
          {/* Status Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-400 font-medium">
              {enhancedEditorEnabled ? 'AI Active' : 'Connected'}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Navigation - Modern Bottom Bar */}
      <div className={`lg:hidden fixed bottom-0 left-0 right-0 ${darkMode ? 'bg-slate-900/95' : 'bg-white/95'} backdrop-blur-xl border-t ${darkMode ? 'border-slate-700/50' : 'border-gray-200'} z-50 safe-area-bottom`}>
        <div className="flex h-16 px-2">
          <button
            onClick={() => setActivePanel('files')}
            className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all relative group`}
          >
            <div className={`p-2 rounded-2xl transition-all ${
              activePanel === 'files'
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg scale-110'
                : darkMode ? 'group-active:bg-slate-700/50' : 'group-active:bg-gray-200'
            }`}>
              <HiFolderOpen className={`w-5 h-5 ${
                activePanel === 'files' ? 'text-white' : darkMode ? 'text-slate-400' : 'text-gray-600'
              }`} />
            </div>
            <span className={`text-[10px] font-medium ${
              activePanel === 'files' 
                ? darkMode ? 'text-blue-400' : 'text-blue-600' 
                : darkMode ? 'text-slate-500' : 'text-gray-500'
            }`}>Files</span>
          </button>
          
          <button
            onClick={() => setActivePanel('editor')}
            className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all relative group`}
          >
            <div className={`p-2 rounded-2xl transition-all ${
              activePanel === 'editor'
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg scale-110'
                : darkMode ? 'group-active:bg-slate-700/50' : 'group-active:bg-gray-200'
            }`}>
              <HiCodeBracket className={`w-5 h-5 ${
                activePanel === 'editor' ? 'text-white' : darkMode ? 'text-slate-400' : 'text-gray-600'
              }`} />
            </div>
            <span className={`text-[10px] font-medium ${
              activePanel === 'editor' 
                ? darkMode ? 'text-blue-400' : 'text-blue-600' 
                : darkMode ? 'text-slate-500' : 'text-gray-500'
            }`}>Code</span>
          </button>
          
          <button
            onClick={() => {
              setActivePanel('terminal');
            }}
            className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all relative group`}
          >
            <div className={`p-2 rounded-2xl transition-all ${
              activePanel === 'terminal'
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg scale-110'
                : darkMode ? 'group-active:bg-slate-700/50' : 'group-active:bg-gray-200'
            }`}>
              <HiCommandLine className={`w-5 h-5 ${
                activePanel === 'terminal' ? 'text-white' : darkMode ? 'text-slate-400' : 'text-gray-600'
              }`} />
            </div>
                          <span className={`text-[10px] font-medium ${
                activePanel === 'terminal'
                  ? darkMode ? 'text-blue-400' : 'text-blue-600' 
                  : darkMode ? 'text-slate-500' : 'text-gray-500'
              }`}>Chat AI</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Layout */}
        <div className="hidden lg:flex w-full">
          {/* Sidebar */}
          <div className={`${sidebarCollapsed ? 'w-16' : 'w-80'} bg-slate-900/50 backdrop-blur border-r border-slate-700/50 transition-all duration-300`}>
            <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
              <div className={`${sidebarCollapsed ? 'hidden' : 'block'}`}>
                <h2 className="text-white font-semibold text-sm">Explorer</h2>
                <p className="text-slate-400 text-xs">{Object.keys(files).length} files</p>
              </div>
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
              >
                <HiSquares2X2 className="w-3.5 h-3.5" />
              </button>
            </div>
            
            {!sidebarCollapsed && (
              <FileExplorer
                files={files}
                folders={folders}
                expandedFolders={expandedFolders}
                selected={selected}
                onSelect={handleFileSelect}
                onAdd={handleFileAdd}
                onAddFolder={handleAddFolder}
                onDelete={handleFileDelete}
                onToggleFolder={handleToggleFolder}
                onRename={handleFileRename}
                onDuplicate={handleFileDuplicate}
                showNotification={showNotification}
              />
            )}
          </div>

          {/* Editor */}
          <div className="flex-1 bg-slate-900/30 flex flex-col">
            {/* Tab Bar */}
            <TabBar
              openTabs={openTabs}
              selectedTab={selected}
              onTabSelect={handleTabSelect}
              onTabClose={handleTabClose}
              files={files}
            />

            {/* Editor Content */}
            <div className="flex-1 flex flex-col">
              <div className="flex-1">
                {selected ? (
                  enhancedEditorEnabled ? (
                    <EnhancedEditorPanel
                      filename={selected}
                      value={files[selected]}
                      language={getLang(selected)}
                      onChange={handleFileEdit}
                      onClose={() => handleTabClose(selected)}
                      onSave={() => showNotification(`Saved ${selected}`, 'success')}
                      hasChanges={false}
                      files={files}
                      setFiles={setFiles}
                      showNotification={showNotification}
                      selectedModel="claude-sonnet-4-20250514"
                    />
                  ) : (
                    <EditorPanel
                      filename={selected}
                      value={files[selected]}
                      language={getLang(selected)}
                      onChange={handleFileEdit}
                      onClose={() => handleTabClose(selected)}
                      onSave={() => showNotification(`Saved ${selected}`, 'success')}
                      hasChanges={false}
                    />
                  )
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <HiCodeBracket className="mx-auto h-16 w-16 text-slate-500 mb-4" />
                      <h3 className="text-lg font-medium text-slate-300">No File Selected</h3>
                      <p className="text-sm text-slate-500 mt-2">Choose a file to start coding</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Code Runner Panel */}
              {showCodeRunner && (
                <CodeRunner
                  files={files}
                  selectedFile={selected}
                  showNotification={showNotification}
                />
              )}
            </div>
          </div>

          {/* Chat Panel */}
          <div className="w-96 bg-slate-900/50 backdrop-blur border-l border-slate-700/50">
            <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
              <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1">
                <button
                  onClick={() => {
                    setActivePanel('terminal');
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    activePanel === 'terminal'
                      ? 'bg-blue-500 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <HiCommandLine className="w-3.5 h-3.5" />
                  Chat AI
                </button>
              </div>
            </div>

            <ModernChat
              files={files}
              setFiles={setFiles}
              selected={selected}
              setSelected={setSelected}
              showNotification={showNotification}
              folders={folders}
              setFolders={setFolders}
              setExpandedFolders={setExpandedFolders}
              setOpenTabs={setOpenTabs}
              currentChatSession={currentChatSession}
              onSwitchChatSession={handleSwitchChatSession}
              onShowChatHistory={() => setShowChatHistory(true)}
            />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden w-full h-full pb-16">
          {activePanel === 'files' && (
            <div className="h-full bg-slate-900/50 overflow-auto">
              <FileExplorer
                files={files}
                folders={folders}
                expandedFolders={expandedFolders}
                selected={selected}
                onSelect={handleFileSelect}
                onAdd={handleFileAdd}
                onAddFolder={handleAddFolder}
                onDelete={handleFileDelete}
                onToggleFolder={handleToggleFolder}
                onRename={handleFileRename}
                onDuplicate={handleFileDuplicate}
                showNotification={showNotification}
              />
            </div>
          )}

          {activePanel === 'editor' && (
            <div className="h-full bg-slate-900/30 flex flex-col overflow-hidden">
              {/* Tab Bar for Mobile */}
              <TabBar
                openTabs={openTabs}
                selectedTab={selected}
                onTabSelect={handleTabSelect}
                onTabClose={handleTabClose}
                files={files}
              />

              {/* Mobile Editor Content */}
              <div className="flex-1 overflow-hidden">
                {selected ? (
                  enhancedEditorEnabled ? (
                    <EnhancedEditorPanel
                      filename={selected}
                      value={files[selected]}
                      language={getLang(selected)}
                      onChange={handleFileEdit}
                      onClose={() => handleTabClose(selected)}
                      onSave={() => showNotification(`Saved ${selected}`, 'success')}
                      hasChanges={false}
                      files={files}
                      setFiles={setFiles}
                      showNotification={showNotification}
                      selectedModel="claude-sonnet-4-20250514"
                    />
                  ) : (
                    <EditorPanel
                      filename={selected}
                      value={files[selected]}
                      language={getLang(selected)}
                      onChange={handleFileEdit}
                      onClose={() => handleTabClose(selected)}
                      onSave={() => showNotification(`Saved ${selected}`, 'success')}
                      hasChanges={false}
                    />
                  )
                ) : (
                  <div className="h-full flex items-center justify-center p-8">
                    <div className="text-center">
                      <HiCodeBracket className="mx-auto h-12 w-12 text-slate-500 mb-4" />
                      <h3 className="text-lg font-medium text-slate-300">No File Selected</h3>
                      <p className="text-sm text-slate-500 mt-2">Go to Files to select a file</p>
                      <button
                        onClick={() => setActivePanel('files')}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                      >
                        Browse Files
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activePanel === 'terminal' && (
            <div className="h-full bg-slate-900/50 overflow-hidden">
              <ModernChat
                files={files}
                setFiles={setFiles}
                selected={selected}
                setSelected={setSelected}
                showNotification={showNotification}
                folders={folders}
                setFolders={setFolders}
                setExpandedFolders={setExpandedFolders}
                setOpenTabs={setOpenTabs}
                currentChatSession={currentChatSession}
                onSwitchChatSession={handleSwitchChatSession}
                onShowChatHistory={() => setShowChatHistory(true)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Notification Panel */}
      <NotificationPanel notifications={notifications} />

      {/* Package Manager Modal */}
      <PackageManager
        files={files}
        showNotification={showNotification}
        isOpen={showPackageManager}
        onClose={() => setShowPackageManager(false)}
      />
      
      {/* Smart Package Manager Modal */}
      <SmartPackageManager
        files={files}
        showNotification={showNotification}
        onAddFile={handleFileUpload}
        isOpen={showSmartPackageManager}
        onClose={() => setShowSmartPackageManager(false)}
      />
      
      {/* Chat History Modal */}
      <ChatHistory
        isOpen={showChatHistory}
        onClose={() => setShowChatHistory(false)}
        onSwitchChat={handleSwitchChatSession}
        currentSessionId={currentChatSession}
        showNotification={showNotification}
      />
      
      {/* Web Inspector Modal */}
      <WebInspector
        isOpen={showWebInspector}
        onClose={() => setShowWebInspector(false)}
        showNotification={showNotification}
      />

      {/* Live Preview Modal */}
      <LivePreview
        files={files}
        selectedFile={selected}
        showNotification={showNotification}
        isOpen={showLivePreview}
        onClose={() => setShowLivePreview(false)}
      />

      {/* Template Selection Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${darkMode ? 'bg-slate-900' : 'bg-white'} rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden`}>
            {/* Modal Header */}
            <div className={`px-6 py-4 border-b ${darkMode ? 'border-slate-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <HiTemplate className={`w-6 h-6 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                  <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Project Templates
                  </h2>
                </div>
                <button
                  onClick={() => setShowTemplates(false)}
                  className={`p-2 rounded-lg ${darkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-600'} transition-colors`}
                >
                  ✕
                </button>
              </div>
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'} mt-1`}>
                Choose a template to quickly start your project
              </p>
            </div>

            {/* Template Grid */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(templates).map(([key, template]) => (
                  <div
                    key={key}
                    className={`p-4 rounded-xl border ${darkMode ? 'border-slate-700 bg-slate-800/50 hover:bg-slate-800' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'} cursor-pointer transition-all group`}
                    onClick={() => handleLoadTemplate(key)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-white'} group-hover:scale-110 transition-transform`}>
                        <HiRocketLaunch className={`w-5 h-5 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                      </div>
                      <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {template.name}
                      </h3>
                    </div>
                    <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'} mb-3`}>
                      {template.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`px-2 py-1 rounded ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-200 text-gray-700'}`}>
                        {Object.keys(template.files).length} files
                      </span>
                      {template.folders.length > 0 && (
                        <span className={`px-2 py-1 rounded ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-200 text-gray-700'}`}>
                          {template.folders.length} folders
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`px-6 py-4 border-t ${darkMode ? 'border-slate-700 bg-slate-800/50' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-gray-500'}`}>
                  Templates will replace your current project
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDownloadProject}
                    className={`px-4 py-2 text-sm rounded-lg ${darkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'} transition-colors`}
                  >
                    Export Current Project
                  </button>
                  <button
                    onClick={() => setShowTemplates(false)}
                    className={`px-4 py-2 text-sm rounded-lg ${darkMode ? 'bg-slate-600 hover:bg-slate-700 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-900'} transition-colors`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
