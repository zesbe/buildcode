import React, { useRef, useEffect, useState } from 'react';

export default function MiniMap({ content, language, onScroll, visible = true }) {
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 100, height: 300 });

  useEffect(() => {
    if (!visible || !content) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const lines = content.split('\n');
    
    // Set canvas size
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    
    // Clear canvas
    ctx.fillStyle = '#0f172a'; // slate-900
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Calculate line height
    const lineHeight = Math.max(1, canvas.height / Math.max(lines.length, 1));
    
    lines.forEach((line, index) => {
      const y = index * lineHeight;
      
      // Determine line color based on content
      let color = '#64748b'; // slate-500 (default)
      
      // Comments
      if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')) {
        color = '#22d3ee'; // cyan-400
      }
      // Strings
      else if (line.includes('"') || line.includes("'") || line.includes('`')) {
        color = '#84cc16'; // lime-500
      }
      // Keywords
      else if (/\\b(function|const|let|var|if|else|for|while|class|import|export|return)\\b/.test(line)) {
        color = '#a855f7'; // purple-500
      }
      // JSX tags
      else if (line.includes('<') && line.includes('>')) {
        color = '#06b6d4'; // cyan-500
      }
      // Brackets and operators
      else if (/[{}\[\]();=+\-*\/><&|!]/.test(line.trim())) {
        color = '#f59e0b'; // amber-500
      }
      
      // Draw line
      if (line.trim()) {
        const lineWidth = Math.min(canvas.width - 2, (line.length / 80) * canvas.width);
        ctx.fillStyle = color;
        ctx.fillRect(2, y, lineWidth, Math.max(1, lineHeight - 1));
      }
    });
    
  }, [content, dimensions, visible]);

  if (!visible) return null;

  return (
    <div className="fixed right-4 top-20 bg-slate-900/90 backdrop-blur-sm border border-slate-700/50 rounded-lg p-2 shadow-lg z-40">
      <div className="text-xs text-slate-400 mb-1 text-center">Map</div>
      <canvas
        ref={canvasRef}
        className="cursor-pointer hover:opacity-80 transition-opacity"
        width={dimensions.width}
        height={dimensions.height}
        onClick={(e) => {
          const rect = e.target.getBoundingClientRect();
          const y = e.clientY - rect.top;
          const linePercentage = y / dimensions.height;
          onScroll?.(linePercentage);
        }}
        style={{
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
          imageRendering: 'pixelated'
        }}
      />
    </div>
  );
}