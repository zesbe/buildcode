import React, { useState } from "react";
import {
  HiFolderOpen,
  HiFolderPlus,
  HiDocumentPlus,
  HiTrash,
  HiChevronRight,
  HiChevronDown,
  HiDocument,
  HiCodeBracket,

  HiPhoto,
  HiCog6Tooth,
  HiEllipsisVertical,
  HiPencil,
  HiDocumentDuplicate,
  HiArrowUpTray,
  HiArrowDownTray
} from "react-icons/hi2";

function getFileIcon(filename) {
  const ext = filename.split('.').pop()?.toLowerCase();
  
  const iconMap = {
    'tsx': { icon: HiCodeBracket, color: 'text-blue-500' },
    'ts': { icon: HiCodeBracket, color: 'text-blue-600' },
    'jsx': { icon: HiCodeBracket, color: 'text-cyan-500' },
    'js': { icon: HiCodeBracket, color: 'text-yellow-500' },
    'css': { icon: HiCodeBracket, color: 'text-blue-400' },
    'scss': { icon: HiCodeBracket, color: 'text-pink-500' },
    'json': { icon: HiCog6Tooth, color: 'text-yellow-600' },
    'md': { icon: HiDocument, color: 'text-gray-500' },
    'html': { icon: HiDocument, color: 'text-orange-500' },
    'jpg': { icon: HiPhoto, color: 'text-green-500' },
    'jpeg': { icon: HiPhoto, color: 'text-green-500' },
    'png': { icon: HiPhoto, color: 'text-green-500' },
    'gif': { icon: HiPhoto, color: 'text-green-500' },
    'svg': { icon: HiPhoto, color: 'text-purple-500' }
  };
  
  return iconMap[ext] || { icon: HiDocument, color: 'text-slate-400' };
}

export default function FileExplorer({
  files,
  folders,
  expandedFolders,
  selected,
  onSelect,
  onAdd,
  onAddFolder,
  onDelete,
  onToggleFolder,
  onRename,
  onDuplicate,
  showNotification
}) {
  const [contextMenu, setContextMenu] = useState(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);

  // Upload file handler
  const handleUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      if (showNotification) {
        showNotification('File too large. Maximum size is 10MB.', 'error');
      }
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const filename = file.name;

        // Check if file already exists
        if (files[filename]) {
          if (showNotification) {
            showNotification(`File "${filename}" already exists`, 'error');
          }
          return;
        }

        // Add file to the project
        onAdd(content, filename);
        if (showNotification) {
          showNotification(`File "${filename}" uploaded successfully`, 'success');
        }
      } catch (error) {
        if (showNotification) {
          showNotification('Failed to process uploaded file', 'error');
        }
      }
    };

    reader.onerror = () => {
      if (showNotification) {
        showNotification('Failed to read file', 'error');
      }
    };

    reader.readAsText(file);
    // Reset input
    event.target.value = '';
  };

  // Download all files as ZIP
  const handleDownloadAll = () => {
    try {
      const projectData = {
        files,
        folders,
        timestamp: new Date().toISOString(),
        version: '1.0'
      };

      const blob = new Blob([JSON.stringify(projectData, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `project-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      if (showNotification) {
        showNotification('Project exported successfully', 'success');
      }
    } catch (error) {
      if (showNotification) {
        showNotification('Failed to export project', 'error');
      }
    }
  };

  // Download single file
  const handleDownloadFile = (filename) => {
    try {
      const content = files[filename];

      // Check if file exists
      if (content === undefined) {
        if (showNotification) {
          showNotification(`File "${filename}" not found`, 'error');
        }
        return;
      }

      const blob = new Blob([content || ''], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      if (showNotification) {
        showNotification(`File "${filename}" downloaded`, 'success');
      }
    } catch (error) {
      if (showNotification) {
        showNotification('Failed to download file', 'error');
      }
    }
  };
  const [hoveredItem, setHoveredItem] = useState(null);

  const organizedFiles = organizeFiles(files, folders);

  function organizeFiles(files, folders) {
    const organized = {
      folders: {},
      rootFiles: []
    };

    // Initialize folders
    folders.forEach(folder => {
      organized.folders[folder] = [];
    });

    // Organize files
    Object.keys(files).forEach(filename => {
      const parts = filename.split('/');
      if (parts.length > 1) {
        const folder = parts[0];
        if (organized.folders[folder]) {
          organized.folders[folder].push(filename);
        }
      } else {
        organized.rootFiles.push(filename);
      }
    });

    return organized;
  }

  function handleContextMenu(e, type, item) {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      type,
      item
    });
  }

  function closeContextMenu() {
    setContextMenu(null);
  }

  function handleAddFolder(parentFolder = null) {
    const trimmedName = newFolderName.trim();
    if (trimmedName) {
      // Validate folder name
      if (!/^[a-zA-Z0-9_.-]+$/.test(trimmedName)) {
        if (showNotification) {
          showNotification('Folder name can only contain letters, numbers, underscores, dots, and hyphens', 'error');
        }
        return;
      }

      const folderName = parentFolder ? `${parentFolder}/${trimmedName}` : trimmedName;

      // Check if folder already exists
      if (folders && folders.includes(folderName)) {
        if (showNotification) {
          showNotification(`Folder "${folderName}" already exists`, 'error');
        }
        return;
      }

      onAddFolder(folderName);
      setNewFolderName("");
      setShowNewFolder(false);
    } else {
      if (showNotification) {
        showNotification('Folder name cannot be empty', 'error');
      }
    }
  }

  function handleKeyPress(e) {
    if (e.key === 'Enter') {
      handleAddFolder();
    } else if (e.key === 'Escape') {
      setShowNewFolder(false);
      setNewFolderName("");
    }
  }

  return (
    <div className="h-full flex flex-col bg-slate-900/30 relative">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
        <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wide">Explorer</h2>
        <div className="flex items-center gap-1">
          {/* Upload Button */}
          <label className="p-1.5 text-slate-400 hover:text-green-400 hover:bg-green-500/10 rounded-md transition-colors cursor-pointer" title="Upload File">
            <HiArrowUpTray className="w-4 h-4" />
            <input
              type="file"
              className="hidden"
              onChange={handleUpload}
              accept=".js,.jsx,.ts,.tsx,.css,.scss,.html,.json,.md,.txt,.py,.java,.cpp,.c,.php,.rb,.go,.rs,.swift,.kt,.dart,.vue,.svelte"
            />
          </label>

          {/* Download All Button */}
          <button
            onClick={handleDownloadAll}
            className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-md transition-colors"
            title="Download Project"
          >
            <HiArrowDownTray className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-slate-600 mx-1"></div>

          <button
            onClick={() => setShowNewFolder(true)}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-md transition-colors"
            title="New Folder"
          >
            <HiFolderPlus className="w-4 h-4" />
          </button>
          <button
            onClick={() => onAdd()}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-md transition-colors"
            title="New File"
          >
            <HiDocumentPlus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        {/* New Folder Input */}
        {showNewFolder && (
          <div className="mb-2 px-2">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={handleKeyPress}
              onBlur={() => setShowNewFolder(false)}
              placeholder="Folder name..."
              className="w-full px-2 py-1 text-sm bg-slate-800 text-white border border-slate-600 rounded focus:outline-none focus:border-blue-400"
              autoFocus
            />
          </div>
        )}

        {/* Folders */}
        {folders.map(folder => (
          <div key={folder} className="mb-1">
            <div
              className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-all group ${
                hoveredItem === `folder:${folder}` ? 'bg-slate-700/50' : ''
              }`}
              onClick={() => onToggleFolder(folder)}
              onMouseEnter={() => setHoveredItem(`folder:${folder}`)}
              onMouseLeave={() => setHoveredItem(null)}
              onContextMenu={(e) => handleContextMenu(e, 'folder', folder)}
            >
              <div className="flex items-center gap-1 text-slate-300">
                {expandedFolders.includes(folder) ? (
                  <HiChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <HiChevronRight className="w-3.5 h-3.5" />
                )}
                <HiFolderOpen className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-sm text-slate-200 font-medium flex-1">{folder}</span>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAdd(null, folder);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-600/50 rounded transition-colors"
                  title="Add file to folder"
                >
                  <HiDocumentPlus className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const subFolderName = prompt(`Create subfolder in "${folder}":`);
                    if (subFolderName && subFolderName.trim()) {
                      onAddFolder(`${folder}/${subFolderName.trim()}`);
                    }
                  }}
                  className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-600/50 rounded transition-colors"
                  title="Add subfolder"
                >
                  <HiFolderPlus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Folder Contents */}
            {expandedFolders.includes(folder) && (
              <div className="ml-4 border-l border-slate-700/30 pl-2">
                {organizedFiles.folders[folder].map(filename => {
                  const baseName = filename.split('/').pop();
                  const { icon: IconComponent, color } = getFileIcon(baseName);
                  
                  return (
                    <div
                      key={filename}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-all group ${
                        selected === filename 
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                          : hoveredItem === filename
                          ? 'bg-slate-700/50 text-slate-200'
                          : 'text-slate-300 hover:text-slate-200'
                      }`}
                      onClick={() => onSelect(filename)}
                      onMouseEnter={() => setHoveredItem(filename)}
                      onMouseLeave={() => setHoveredItem(null)}
                      onContextMenu={(e) => handleContextMenu(e, 'file', filename)}
                    >
                      <IconComponent className={`w-4 h-4 ${color}`} />
                      <span className="text-sm flex-1 truncate">{baseName}</span>
                      {selected === filename && (
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {/* Root Files */}
        {organizedFiles.rootFiles.map(filename => {
          const { icon: IconComponent, color } = getFileIcon(filename);
          
          return (
            <div
              key={filename}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-all group ${
                selected === filename 
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                  : hoveredItem === filename
                  ? 'bg-slate-700/50 text-slate-200'
                  : 'text-slate-300 hover:text-slate-200'
              }`}
              onClick={() => onSelect(filename)}
              onMouseEnter={() => setHoveredItem(filename)}
              onMouseLeave={() => setHoveredItem(null)}
              onContextMenu={(e) => handleContextMenu(e, 'file', filename)}
            >
              <IconComponent className={`w-4 h-4 ${color}`} />
              <span className="text-sm flex-1 truncate">{filename}</span>
              {selected === filename && (
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              )}
            </div>
          );
        })}

        {/* Empty State */}
        {Object.keys(files).length === 0 && (
          <div className="text-center py-8">
            <HiDocument className="mx-auto h-12 w-12 text-slate-500 mb-3" />
            <p className="text-sm text-slate-400 mb-4">No files yet</p>
            <button
              onClick={() => onAdd()}
              className="px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
            >
              Create your first file
            </button>
          </div>
        )}
      </div>

      {/* Project Stats */}
      <div className="p-4 border-t border-slate-700/50 bg-slate-800/30">
        <div className="text-xs text-slate-400 space-y-1">
          <div className="flex justify-between">
            <span>Files:</span>
            <span className="text-slate-300 font-medium">{Object.keys(files).length}</span>
          </div>
          <div className="flex justify-between">
            <span>Folders:</span>
            <span className="text-slate-300 font-medium">{folders.length}</span>
          </div>
          {selected && (
            <div className="flex justify-between">
              <span>Active:</span>
              <span className="text-blue-400 font-medium truncate ml-2">{selected.split('/').pop()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={closeContextMenu}
          />
          <div
            className="fixed z-50 bg-slate-800 border border-slate-600 rounded-lg shadow-xl py-1 min-w-[160px]"
            style={{
              left: contextMenu.x,
              top: contextMenu.y
            }}
          >
            {contextMenu.type === 'file' ? (
              <>
                <button
                  onClick={() => {
                    onSelect(contextMenu.item);
                    closeContextMenu();
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-700 flex items-center gap-2"
                >
                  <HiDocument className="w-3.5 h-3.5" />
                  Open
                </button>
                <button
                  onClick={() => {
                    try {
                      handleDownloadFile(contextMenu.item);
                      closeContextMenu();
                    } catch (error) {
                      if (showNotification) {
                        showNotification('Download failed', 'error');
                      }
                      closeContextMenu();
                    }
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-blue-400 hover:bg-blue-500/10 flex items-center gap-2"
                >
                  <HiArrowDownTray className="w-3.5 h-3.5" />
                  Download
                </button>
                <button
                  onClick={() => {
                    try {
                      const newName = prompt(`Rename "${contextMenu.item}" to:`, contextMenu.item);
                      if (newName && newName.trim() && newName !== contextMenu.item) {
                        const trimmedName = newName.trim();

                        // Validate new name
                        if (!/^[a-zA-Z0-9_.-]+$/.test(trimmedName)) {
                          if (showNotification) {
                            showNotification('File name can only contain letters, numbers, underscores, dots, and hyphens', 'error');
                          }
                        } else if (files[trimmedName]) {
                          if (showNotification) {
                            showNotification(`File "${trimmedName}" already exists`, 'error');
                          }
                        } else {
                          onRename && onRename(contextMenu.item, trimmedName);
                        }
                      }
                    } catch (error) {
                      if (showNotification) {
                        showNotification('Rename failed', 'error');
                      }
                    }
                    closeContextMenu();
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-700 flex items-center gap-2"
                >
                  <HiPencil className="w-3.5 h-3.5" />
                  Rename
                </button>
                <button
                  onClick={() => {
                    try {
                      const baseName = contextMenu.item.split('/').pop();
                      const dir = contextMenu.item.includes('/') ? contextMenu.item.substring(0, contextMenu.item.lastIndexOf('/') + 1) : '';
                      const defaultName = `copy_${baseName}`;
                      const newName = prompt(`Duplicate "${baseName}" as:`, defaultName);

                      if (newName && newName.trim()) {
                        const trimmedName = newName.trim();
                        const fullPath = dir + trimmedName;

                        // Validate name
                        if (!/^[a-zA-Z0-9_.-]+$/.test(trimmedName)) {
                          if (showNotification) {
                            showNotification('File name can only contain letters, numbers, underscores, dots, and hyphens', 'error');
                          }
                        } else if (files[fullPath]) {
                          if (showNotification) {
                            showNotification(`File "${fullPath}" already exists`, 'error');
                          }
                        } else {
                          onDuplicate && onDuplicate(contextMenu.item, fullPath);
                          if (showNotification) {
                            showNotification(`File duplicated as "${fullPath}"`, 'success');
                          }
                        }
                      }
                    } catch (error) {
                      if (showNotification) {
                        showNotification('Duplicate failed', 'error');
                      }
                    }
                    closeContextMenu();
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-700 flex items-center gap-2"
                >
                  <HiDocumentDuplicate className="w-3.5 h-3.5" />
                  Duplicate
                </button>
                <hr className="border-slate-600 my-1" />
                <button
                  onClick={() => {
                    onDelete(contextMenu.item);
                    closeContextMenu();
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                >
                  <HiTrash className="w-3.5 h-3.5" />
                  Delete
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    onAdd(null, contextMenu.item);
                    closeContextMenu();
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-700 flex items-center gap-2"
                >
                  <HiDocumentPlus className="w-3.5 h-3.5" />
                  New File
                </button>
                <button
                  onClick={() => {
                    setShowNewFolder(true);
                    closeContextMenu();
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-700 flex items-center gap-2"
                >
                  <HiFolderPlus className="w-3.5 h-3.5" />
                  New Folder
                </button>
                <hr className="border-slate-600 my-1" />
                <button
                  onClick={() => {
                    onDelete(`folder:${contextMenu.item}`);
                    closeContextMenu();
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                >
                  <HiTrash className="w-3.5 h-3.5" />
                  Delete Folder
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
