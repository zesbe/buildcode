import React, { useState, useEffect } from 'react';
import { 
  HiChatBubbleLeftEllipsis, 
  HiXMark, 
  HiPlus, 
  HiTrash, 
  HiPencil,
  HiArrowDownTray,
  HiArrowUpTray,
  HiInformationCircle,
  HiMagnifyingGlass
} from 'react-icons/hi2';
import { chatStorage } from '../utils/chatStorage';

export default function ChatHistory({ isOpen, onClose, onSwitchChat, currentSessionId, showNotification }) {
  const [sessions, setSessions] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [storageInfo, setStorageInfo] = useState({});

  useEffect(() => {
    if (isOpen) {
      loadSessions();
      setStorageInfo(chatStorage.getStorageInfo());
    }
  }, [isOpen]);

  const loadSessions = () => {
    const allSessions = chatStorage.getAllSessions();
    setSessions(allSessions);
  };

  const handleNewChat = () => {
    const newSessionId = chatStorage.createNewSession();
    onSwitchChat(newSessionId);
    loadSessions();
    showNotification('New chat session created', 'success');
  };

  const handleSwitchChat = (sessionId) => {
    onSwitchChat(sessionId);
    onClose();
    showNotification('Switched to chat session', 'success');
  };

  const handleDeleteSession = (sessionId, e) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this chat session?')) {
      chatStorage.deleteSession(sessionId);
      loadSessions();
      showNotification('Chat session deleted', 'success');
    }
  };

  const handleEditTitle = (sessionId, currentTitle, e) => {
    e.stopPropagation();
    setEditingId(sessionId);
    setEditTitle(currentTitle);
  };

  const handleSaveTitle = (sessionId) => {
    if (editTitle.trim()) {
      chatStorage.updateSessionTitle(sessionId, editTitle.trim());
      loadSessions();
      showNotification('Chat title updated', 'success');
    }
    setEditingId(null);
    setEditTitle('');
  };

  const handleExportChats = () => {
    chatStorage.exportAllChats();
    showNotification('Chat history exported successfully', 'success');
  };

  const handleImportChats = (e) => {
    const file = e.target.files[0];
    if (file) {
      chatStorage.importChats(file)
        .then((count) => {
          loadSessions();
          showNotification(`Imported ${count} chat sessions successfully`, 'success');
        })
        .catch((error) => {
          showNotification('Error importing chat history', 'error');
          console.error('Import error:', error);
        });
    }
    e.target.value = '';
  };

  const filteredSessions = Object.values(sessions).filter(session =>
    session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.messages.some(msg => 
      msg.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
  ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <HiChatBubbleLeftEllipsis className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Chat History</h2>
            <div className="text-sm text-slate-400">
              {Object.keys(sessions).length} sessions
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleNewChat}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
            >
              <HiPlus className="w-4 h-4" />
              New Chat
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <HiXMark className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="p-4 border-b border-slate-700 space-y-3">
          <div className="relative">
            <HiMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search chat history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportChats}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
              >
                <HiArrowDownTray className="w-4 h-4" />
                Export
              </button>
              <label className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors cursor-pointer">
                <HiArrowUpTray className="w-4 h-4" />
                Import
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportChats}
                  className="hidden"
                />
              </label>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <HiInformationCircle className="w-4 h-4" />
              <span>{storageInfo.sizeInKB}KB used</span>
            </div>
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredSessions.length === 0 ? (
            <div className="text-center py-12">
              <HiChatBubbleLeftEllipsis className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-400 mb-2">
                {searchTerm ? 'No matching chats found' : 'No chat history yet'}
              </h3>
              <p className="text-slate-500 mb-4">
                {searchTerm ? 'Try different search terms' : 'Start a conversation to see your chat history here'}
              </p>
              {!searchTerm && (
                <button
                  onClick={handleNewChat}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Start New Chat
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSessions.map(session => (
                <div
                  key={session.id}
                  onClick={() => handleSwitchChat(session.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all hover:border-blue-500/50 ${
                    session.id === currentSessionId
                      ? 'bg-blue-500/10 border-blue-500/30'
                      : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      {editingId === session.id ? (
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onBlur={() => handleSaveTitle(session.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveTitle(session.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          className="w-full bg-slate-700 text-white px-2 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <h3 className="font-medium text-white text-sm mb-1">{session.title}</h3>
                      )}
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span>{session.messages.length} messages</span>
                        <span>•</span>
                        <span>{session.updatedAt ? new Date(session.updatedAt).toLocaleDateString() : '--'}</span>
                        <span>•</span>
                        <span>{session.updatedAt ? (() => {
                          try {
                            return new Date(session.updatedAt).toLocaleTimeString();
                          } catch (e) {
                            return '--:--';
                          }
                        })() : '--:--'}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={(e) => handleEditTitle(session.id, session.title, e)}
                        className="p-1.5 hover:bg-slate-600 text-slate-400 hover:text-white rounded transition-colors"
                        title="Edit title"
                      >
                        <HiPencil className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteSession(session.id, e)}
                        className="p-1.5 hover:bg-red-600 text-slate-400 hover:text-white rounded transition-colors"
                        title="Delete session"
                      >
                        <HiTrash className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Preview of last message */}
                  {session.messages.length > 0 && (
                    <div className="text-xs text-slate-500 line-clamp-2">
                      {session.messages[session.messages.length - 1].content.substring(0, 150)}...
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with storage info */}
        <div className="p-4 border-t border-slate-700 bg-slate-800/50">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div>
              Storage: {storageInfo.sizeInKB}KB / {storageInfo.maxStorageKB}KB
            </div>
            <div>
              {storageInfo.totalMessages} total messages across {storageInfo.sessionsCount} sessions
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}