import React, { useState, useRef, useEffect } from "react";
import { HiPaperAirplane, HiSparkles, HiUser, HiBolt, HiChatBubbleLeftEllipsis } from "react-icons/hi2";
import { chatClaude } from "../utils/claudeApi";
import { parseAICommand, executeAICommands } from "../utils/aiFileActions";
import { smartFileCreation } from "../utils/advancedFileOperations";
import { chatStorage } from "../utils/chatStorage";

export default function TerminalStyleChat({ files, setFiles, selected, setSelected, showNotification, folders, setFolders, setExpandedFolders, setOpenTabs, currentChatSession, onSwitchChatSession, onShowChatHistory }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedModel, setSelectedModel] = useState("claude-sonnet-4-20250514");
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Auto-focus input when component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Load chat history when session changes
  useEffect(() => {
    if (currentChatSession) {
      const chatHistory = chatStorage.loadChatHistory();
      if (chatHistory.length === 0) {
        // Set default welcome message for new sessions
        setMessages([{
          type: 'assistant',
          content: 'Halo! 👋 Saya Claude, asisten AI Anda. Saya siap membantu dengan coding, membuat file, atau menjawab pertanyaan Anda.',
          timestamp: new Date(),
          role: 'assistant'
        }]);
      } else {
        setMessages(chatHistory);
      }
    }
  }, [currentChatSession]);

  // Save chat history whenever messages change
  useEffect(() => {
    if (messages.length > 0 && currentChatSession) {
      // Convert messages to proper format and save
      const formattedMessages = messages.map(msg => ({
        ...msg,
        role: msg.type === 'user' ? 'user' : 'assistant'
      }));
      chatStorage.saveChatHistory(formattedMessages);
    }
  }, [messages, currentChatSession]);

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isProcessing) return;

    // Add user message
    const userMessage = {
      type: 'user',
      content: trimmedInput,
      timestamp: new Date(),
      role: 'user'
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      // Build context for AI
      let aiPrompt = trimmedInput;
      
      // Add current file context if available
      if (selected && files[selected]) {
        aiPrompt += `\n\nFile saat ini: ${selected}\nIsi:\n${files[selected]}`;
      }

      // Add project files list
      aiPrompt += `\n\nFile dalam project: ${Object.keys(files).join(', ')}`;

      // Call Claude API
      const response = await chatClaude({ 
        messages: [{ 
          role: "user", 
          content: `Anda adalah asisten coding AI yang membantu. User request: "${trimmedInput}"\n\n${aiPrompt}\n\nBerikan response yang helpful dan concise. Jika membuat file, gunakan extension yang tepat dan TypeScript jika memungkinkan.`
        }], 
        model: selectedModel 
      });

      const aiResponse = response.content?.[0]?.text || "Maaf, saya tidak bisa memproses permintaan tersebut.";
      
      // Add AI response
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        role: 'assistant'
      }]);

      // Auto-execute file operations if AI suggests them
      const commands = parseAICommand(aiResponse, files);
      if (commands.length > 0) {
        executeAICommands(commands, files, setFiles, setSelected, showNotification, folders, setFolders, setOpenTabs);
      }

    } catch (error) {
      setMessages(prev => [...prev, {
        type: 'error',
        content: `Error: ${error.message}\n\nPastikan API key Anda sudah benar.`,
        timestamp: new Date(),
        role: 'assistant'
      }]);
    }

    setIsProcessing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp) => {
    try {
      // Ensure timestamp is a Date object
      const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
      return date.toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit'
      });
    } catch (error) {
      console.warn('Invalid timestamp:', timestamp, error);
      return '--:--';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <HiSparkles className="text-white w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">Claude AI Assistant</h3>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Online • {messages.length} messages</span>
            </div>
          </div>
        </div>
        
        {/* Chat History Button */}
        <button
          onClick={onShowChatHistory}
          className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors"
          title="Chat History"
        >
          <HiChatBubbleLeftEllipsis className="w-4 h-4" />
        </button>
        
        <select 
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="bg-slate-800 text-white text-xs rounded-lg px-3 py-1.5 border border-slate-700"
        >
          <option value="claude-opus-4-20250514">Claude Opus</option>
          <option value="claude-sonnet-4-20250514">Claude Sonnet</option>
        </select>
      </div>

      {/* Chat Messages Area */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0"
        onClick={() => inputRef.current?.focus()}
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${
              message.type === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.type !== 'user' && (
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'assistant' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                    : 'bg-red-500'
                }`}>
                  {message.type === 'assistant' ? (
                    <HiSparkles className="w-4 h-4 text-white" />
                  ) : (
                    <span className="text-white text-xs font-bold">!</span>
                  )}
                </div>
              </div>
            )}

            <div className={`flex flex-col max-w-[80%] ${
              message.type === 'user' ? 'items-end' : 'items-start'
            }`}>
              <div className={`rounded-2xl px-4 py-2.5 ${
                message.type === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : message.type === 'assistant'
                  ? 'bg-slate-800 text-slate-100'
                  : 'bg-red-900/20 text-red-400 border border-red-800'
              }`}>
                <p className="text-sm whitespace-pre-wrap break-words">
                  {message.content}
                </p>
              </div>
              <span className="text-xs text-slate-500 mt-1 px-2">
                {formatTime(message.timestamp)}
              </span>
            </div>

            {message.type === 'user' && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                  <HiUser className="w-4 h-4 text-slate-300" />
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {isProcessing && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <HiSparkles className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="bg-slate-800 rounded-2xl px-4 py-3 max-w-[80%]">
              <div className="flex items-center gap-2">
                <HiBolt className="w-4 h-4 text-blue-400 animate-spin" />
                <span className="text-sm text-slate-300">Claude sedang mengetik</span>
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-800 bg-slate-900 p-4 flex-shrink-0">
        <div className="flex gap-3 items-end">
          <div className="flex-1 bg-slate-800 rounded-2xl border border-slate-700 focus-within:border-blue-500 transition-colors">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ketik pesan atau perintah..."
              className="w-full bg-transparent text-white placeholder-slate-400 outline-none p-3 resize-none max-h-32"
              rows="1"
              disabled={isProcessing}
              style={{
                minHeight: '44px',
                height: 'auto'
              }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={isProcessing || !input.trim()}
            className={`p-3 rounded-full transition-all ${
              isProcessing || !input.trim()
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            <HiPaperAirplane className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
          <span>Enter untuk kirim</span>
          <span>Shift+Enter untuk baris baru</span>
        </div>
      </div>
    </div>
  );
}
