import React from "react";
import dynamic from "next/dynamic";
import { HiOutlineDocumentText, HiXMark, HiCloudArrowUp } from "react-icons/hi2";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

export default function EditorPanel({ filename, value, language, onChange, onClose, onSave, hasChanges = false }) {
  return (
    <div className="flex flex-col h-full bg-slate-900/50 backdrop-blur border border-slate-700/30 m-4 rounded-xl shadow-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/70 border-b border-slate-700/50">
        <HiOutlineDocumentText className="text-blue-400 w-[18px] h-[18px]" />
        <span className="font-mono text-sm text-slate-200 font-medium flex items-center gap-2">
          {filename}
          {hasChanges && <div className="w-1.5 h-1.5 bg-orange-400 rounded-full" title="Unsaved changes"></div>}
        </span>
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${hasChanges ? 'bg-orange-400 animate-pulse' : 'bg-green-400'}`}></div>
            <span className="text-xs text-slate-400">{hasChanges ? 'Modified' : 'Saved'}</span>
          </div>

          {/* Save Button */}
          {onSave && (
            <button
              onClick={onSave}
              className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-700/50 rounded-lg transition-colors"
              title="Save file (Ctrl+S)"
            >
              <HiCloudArrowUp className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              title="Close file"
            >
              <HiXMark className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
      <div className="flex-1">
        <MonacoEditor
          height="100%"
          language={language}
          value={value}
          onChange={onChange}
          theme="vs-dark"
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            fontFamily: "JetBrains Mono, Menlo, Monaco, 'Courier New', monospace",
            scrollbar: { vertical: "auto", horizontal: "auto" },
            smoothScrolling: true,
            roundedSelection: true,
            cursorBlinking: "smooth",
            lineNumbers: "on",
            folding: true,
            wordWrap: "on",
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
}
