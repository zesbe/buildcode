import React, { useState, useRef, useEffect } from "react";
import { chatClaudeStream } from "../utils/claudeApiStream";
import { HiMiniUser, HiSparkles, HiArrowPath } from "react-icons/hi2";

export default function ChatPanelStreaming({ chat, setChat, onClaudeAction }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("claude-sonnet-4-20250514");
  const [retryCount, setRetryCount] = useState(0);
  const endRef = useRef();

  const models = [
    { 
      value: "claude-opus-4-20250514", 
      label: "Claude 4 Opus", 
      description: "🧠 Most capable & intelligent"
    },
    { 
      value: "claude-sonnet-4-20250514", 
      label: "Claude 4 Sonnet", 
      description: "⚡ Fast & balanced"
    }
  ];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  async function send(isRetry = false) {
    if (!input.trim() && !isRetry) return;
    
    setLoading(true);
    const messageToSend = isRetry ? chat[chat.length - 2]?.content || input : input;
    const newChat = isRetry ? chat.slice(0, -1) : [...chat, { role: "user", content: messageToSend }];
    
    if (!isRetry) {
      setChat(newChat);
      setInput("");
    }

    // Add empty assistant message for streaming
    const assistantMessageIndex = newChat.length;
    setChat([...newChat, { role: "assistant", content: "", isStreaming: true }]);

    let streamedContent = "";

    try {
      await chatClaudeStream({
        messages: newChat,
        model: selectedModel,
        onChunk: (chunk) => {
          streamedContent += chunk;
          setChat(prev => {
            const updated = [...prev];
            updated[assistantMessageIndex] = {
              role: "assistant",
              content: streamedContent,
              isStreaming: true
            };
            return updated;
          });
        },
        onComplete: () => {
          setChat(prev => {
            const updated = [...prev];
            updated[assistantMessageIndex] = {
              role: "assistant",
              content: streamedContent,
              isStreaming: false
            };
            return updated;
          });
          setRetryCount(0);
          
          // Deteksi command Claude
          if (onClaudeAction) onClaudeAction(streamedContent);
          setLoading(false);
        },
        onError: (error) => {
          console.error('Chat error:', error);
          let errorMessage = `❌ Error: ${error.message || "Failed to connect to Claude API."}`;
          
          // Special handling untuk error messages
          if (error.message.includes('405')) {
            errorMessage = `❌ Model ${selectedModel} tidak tersedia. Coba model lain atau tunggu beberapa saat.`;
          } else if (error.message.includes('404')) {
            errorMessage = `❌ Model ${selectedModel} tidak ditemukan. Pastikan menggunakan Claude 4.`;
          }
          
          setChat(prev => {
            const updated = [...prev];
            updated[assistantMessageIndex] = {
              role: "assistant",
              content: errorMessage,
              isError: true,
              isStreaming: false
            };
            return updated;
          });
          setRetryCount(prev => prev + 1);
          setLoading(false);
        }
      });
    } catch (e) {
      console.error('Unexpected error:', e);
      setChat(prev => {
        const updated = [...prev];
        updated[assistantMessageIndex] = {
          role: "assistant",
          content: `❌ Unexpected error: ${e.message}`,
          isError: true,
          isStreaming: false
        };
        return updated;
      });
      setLoading(false);
    }
  }

  const handleRetry = () => {
    send(true);
  };

  const currentModel = models.find(m => m.value === selectedModel);

  // Format message content to be more compact
  const formatMessage = (content) => {
    // Break long lines and format for better readability
    return content
      .split('\n')
      .map(line => line.length > 80 ? 
        line.match(/.{1,80}(\s|$)/g)?.join('\n') || line : line
      )
      .join('\n');
  };

  // Streaming dots component
  const StreamingDots = () => (
    <div className="flex items-center gap-1">
      <span className="inline-block w-1.5 h-1.5 bg-current rounded-full animate-pulse opacity-50" />
      <span className="inline-block w-1.5 h-1.5 bg-current rounded-full animate-pulse opacity-50" style={{ animationDelay: '150ms' }} />
      <span className="inline-block w-1.5 h-1.5 bg-current rounded-full animate-pulse opacity-50" style={{ animationDelay: '300ms' }} />
    </div>
  );

  // Cursor component for streaming text
  const StreamingCursor = () => (
    <span className="inline-block w-0.5 h-3 bg-current opacity-70 animate-pulse ml-0.5" />
  );

  return (
    <div className="flex flex-col h-full bg-slate-800/50 backdrop-blur-md rounded-xl shadow-xl border border-slate-700/50 overflow-hidden">
      {/* Header with Model Selection */}
      <div className="px-3 md:px-4 py-3 md:py-4 border-b border-slate-700/50 bg-slate-800/30 backdrop-blur">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-1.5 md:p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <HiSparkles className="text-white w-4 h-4" />
          </div>
          <span className="font-semibold text-white text-sm md:text-base">Claude 4 Chat</span>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Model:</span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-slate-700/50 text-white text-xs rounded-lg px-2 md:px-3 py-1 md:py-1.5 border border-slate-600/50 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50 flex-1"
              title={currentModel?.description}
            >
              {models.map((model) => (
                <option key={model.value} value={model.value}>
                  {model.label}
                </option>
              ))}
            </select>
            <div className={`w-2 h-2 rounded-full ${selectedModel.includes('opus') ? 'bg-purple-400' : 'bg-blue-400'} animate-pulse`}
                 title={currentModel?.description}></div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400 font-medium">Connected</span>
            </div>
            <div className="text-xs text-slate-400">
              {selectedModel.includes('opus') ? '🧠 Most Capable' : '⚡ Fast & Balanced'}
            </div>
          </div>
        </div>
      </div>
      
      {/* Chat Messages - Compact Column Style */}
      <div className="flex-1 overflow-y-auto px-2 md:px-3 py-3 md:py-4 space-y-2">
        {chat.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`
              max-w-[85%] md:max-w-[75%] px-3 py-2 rounded-2xl shadow-sm transition-all
              ${msg.role === "user"
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md"
                : msg.isError
                ? "bg-red-500/20 text-red-300 rounded-bl-md border border-red-500/30"
                : "bg-slate-700/40 text-slate-100 rounded-bl-md border border-slate-600/20"
              }
            `}>
              {/* Message Header */}
              <div className="flex items-center gap-1.5 mb-1">
                {msg.role === "user"
                  ? <HiMiniUser className="text-blue-100 w-3 h-3" />
                  : <HiSparkles className="text-yellow-400 w-3 h-3" />}
                <span className="text-xs font-medium opacity-75">
                  {msg.role === "user" ? "You" : "Claude 4"}
                </span>
                {msg.isError && retryCount > 0 && (
                  <button
                    onClick={handleRetry}
                    className="ml-auto text-xs text-red-300 hover:text-red-200 flex items-center gap-1"
                    title="Retry message"
                  >
                    <HiArrowPath className="w-3 h-3" />
                    Retry
                  </button>
                )}
              </div>
              
              {/* Message Content with Streaming Support */}
              <div className="text-xs leading-relaxed">
                {msg.content ? (
                  <>
                    {formatMessage(msg.content).split('\n').map((line, lineIndex) => (
                      <div key={lineIndex} className={`${line.trim() === '' ? 'h-2' : ''}`}>
                        {line}
                      </div>
                    ))}
                    {msg.isStreaming && <StreamingCursor />}
                  </>
                ) : msg.isStreaming ? (
                  <StreamingDots />
                ) : null}
              </div>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Input Area - Compact */}
      <div className="px-2 md:px-3 py-2 md:py-3 border-t border-slate-700/50 bg-slate-800/30">
        <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder={loading ? "Claude is responding..." : "Type a message..."}
            className="flex-1 px-3 md:px-4 py-2 md:py-2.5 bg-slate-700/50 text-white text-xs md:text-sm rounded-xl border border-slate-600/50 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50 disabled:opacity-50 disabled:cursor-not-allowed placeholder-slate-400"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-3 md:px-4 py-2 md:py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs md:text-sm font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-1.5"
          >
            <span className="hidden sm:inline">Send</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}