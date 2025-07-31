// Utility untuk parsing command AI yang lebih canggih + auto-detection
export function parseAICommand(text, existingFiles = {}) {
  const commands = [];

  // Pattern untuk explicit commands
  const createPattern = /(?:buat|create) file (?:baru )?(?:bernama |named )?([^\s]+)(?: berisi| with| content)?(?:\s*```(\w+)?\n)?([\s\S]+?)(?:```|$)/gi;
  const editPattern = /(?:edit|ubah|update) file ([^\s]+)(?: jadi| to| content)?(?:\s*```(\w+)?\n)?([\s\S]+?)(?:```|$)/gi;
  const replacePattern = /(?:replace|ganti) in file ([^\s]+) text "([^"]+)" (?:with|jadi) "([^"]+)"/gi;
  const deletePattern = /(?:delete|hapus) file ([^\s]+)/gi;
  const renamePattern = /(?:rename|ubah nama) file ([^\s]+) (?:to|jadi) ([^\s]+)/gi;

  let match;

  // Parse explicit commands first
  while ((match = createPattern.exec(text)) !== null) {
    commands.push({
      type: 'create',
      filename: match[1],
      language: match[2] || 'plaintext',
      content: match[3].trim(),
      isExplicit: true
    });
  }

  while ((match = editPattern.exec(text)) !== null) {
    commands.push({
      type: 'edit',
      filename: match[1],
      language: match[2] || 'plaintext',
      content: match[3].trim(),
      isExplicit: true
    });
  }

  while ((match = replacePattern.exec(text)) !== null) {
    commands.push({
      type: 'replace',
      filename: match[1],
      oldText: match[2],
      newText: match[3],
      isExplicit: true
    });
  }

  while ((match = deletePattern.exec(text)) !== null) {
    commands.push({
      type: 'delete',
      filename: match[1],
      isExplicit: true
    });
  }

  while ((match = renamePattern.exec(text)) !== null) {
    commands.push({
      type: 'rename',
      oldName: match[1],
      newName: match[2],
      isExplicit: true
    });
  }

  // Auto-detect code blocks if no explicit commands found
  if (commands.length === 0) {
    const autoCommands = autoDetectCodeBlocks(text, existingFiles);
    commands.push(...autoCommands);
  }

  return commands;
}

// Auto-detection untuk code blocks
export function autoDetectCodeBlocks(text, existingFiles = {}) {
  const commands = [];

  // Pattern untuk mendeteksi code blocks dengan filename hints
  const codeBlockWithFilenamePattern = /(?:untuk|for|in|file)\s+([^\s]+\.\w+).*?```(\w+)?\n([\s\S]+?)```/gi;

  // Pattern untuk mendeteksi code blocks biasa
  const codeBlockPattern = /```(\w+)?\n([\s\S]+?)```/g;

  // Pattern untuk inline filename mentions
  const filenameMentionPattern = /([a-zA-Z0-9_.-]+\.(js|jsx|ts|tsx|py|css|html|md|json|txt))/g;

  let match;
  const detectedFilenames = new Set();

  // 1. Deteksi code blocks dengan filename hints
  while ((match = codeBlockWithFilenamePattern.exec(text)) !== null) {
    const filename = match[1];
    const language = match[2] || getLanguageFromExtension(filename);
    const content = match[3].trim();

    if (filename && content) {
      commands.push({
        type: existingFiles[filename] ? 'edit' : 'create',
        filename,
        language,
        content,
        isExplicit: false,
        confidence: 'high'
      });
      detectedFilenames.add(filename);
    }
  }

  // 2. Deteksi filename mentions dalam teks
  const mentionedFilenames = [];
  while ((match = filenameMentionPattern.exec(text)) !== null) {
    mentionedFilenames.push(match[1]);
  }

  // 3. Deteksi code blocks tanpa filename hints
  let codeBlockIndex = 0;
  while ((match = codeBlockPattern.exec(text)) !== null) {
    const language = match[1];
    const content = match[2].trim();

    if (content) {
      // Skip jika sudah diproses di step 1
      const textBefore = text.substring(0, match.index);
      const hasFilenameHint = /(?:untuk|for|in|file)\s+[^\s]+\.\w+/.test(textBefore.slice(-50));

      if (!hasFilenameHint) {
        // Cari filename dari context atau generate
        let filename = null;

        // Coba cari filename dari mentions terdekat
        if (mentionedFilenames.length > 0) {
          filename = mentionedFilenames[Math.min(codeBlockIndex, mentionedFilenames.length - 1)];
        } else {
          // Generate filename berdasarkan language dan content
          filename = generateSmartFilename(content, language);
        }

        if (filename && !detectedFilenames.has(filename)) {
          commands.push({
            type: existingFiles[filename] ? 'edit' : 'create',
            filename,
            language: language || getLanguageFromExtension(filename),
            content,
            isExplicit: false,
            confidence: 'medium'
          });
          detectedFilenames.add(filename);
        }

        codeBlockIndex++;
      }
    }
  }

  return commands;
}

// Generate filename cerdas berdasarkan content (prioritas TypeScript)
function generateSmartFilename(content, language) {
  const lines = content.split('\n');
  const hasTypeScript = content.includes('interface ') || content.includes(': string') || content.includes(': number') || content.includes('<T>');

  // Deteksi patterns untuk generate nama file
  for (const line of lines) {
    // React component (prioritas TypeScript)
    if (line.includes('export default function') || line.includes('function ')) {
      const functionMatch = line.match(/function\s+([A-Z][a-zA-Z0-9]*)/);
      if (functionMatch) {
        return hasTypeScript || language === 'tsx' || language === 'typescript'
          ? `${functionMatch[1]}.tsx`
          : `${functionMatch[1]}.jsx`;
      }
    }

    // Interface definitions
    if (line.includes('interface ')) {
      const interfaceMatch = line.match(/interface\s+([A-Z][a-zA-Z0-9]*)/);
      if (interfaceMatch) {
        return `${interfaceMatch[1]}.types.ts`;
      }
    }

    // Custom hooks
    if (line.includes('export function use') || line.includes('function use')) {
      const hookMatch = line.match(/function\s+(use[A-Z][a-zA-Z0-9]*)/);
      if (hookMatch) {
        return hasTypeScript ? `${hookMatch[1]}.ts` : `${hookMatch[1]}.js`;
      }
    }

    // Class names
    if (line.includes('class ')) {
      const classMatch = line.match(/class\s+([A-Z][a-zA-Z0-9]*)/);
      if (classMatch) {
        if (language === 'python') return `${classMatch[1]}.py`;
        return hasTypeScript ? `${classMatch[1]}.ts` : `${classMatch[1]}.js`;
      }
    }

    // CSS classes
    if (line.includes('.') && (language === 'css' || line.includes('{'))) {
      return 'styles.css';
    }

    // HTML
    if (line.includes('<html') || line.includes('<!DOCTYPE')) {
      return 'index.html';
    }

    // Package.json
    if (line.includes('"name"') && line.includes('"version"')) {
      return 'package.json';
    }
  }

  // Default names berdasarkan language (prioritas TypeScript)
  const defaultNames = {
    'javascript': hasTypeScript ? 'script.ts' : 'script.js',
    'jsx': hasTypeScript ? 'Component.tsx' : 'Component.jsx',
    'typescript': 'script.ts',
    'tsx': 'Component.tsx',
    'python': 'script.py',
    'css': 'styles.css',
    'html': 'index.html',
    'json': 'data.json',
    'markdown': 'README.md'
  };

  return defaultNames[language] || (hasTypeScript ? 'file.ts' : 'file.txt');
}

// Get language dari file extension (prioritas TypeScript)
function getLanguageFromExtension(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  const languageMap = {
    'ts': 'typescript',
    'tsx': 'tsx',
    'js': 'javascript',
    'jsx': 'jsx',
    'py': 'python',
    'css': 'css',
    'html': 'html',
    'json': 'json',
    'md': 'markdown',
    'txt': 'plaintext',
    'vue': 'vue',
    'svelte': 'svelte'
  };

  return languageMap[ext] || 'typescript'; // Default ke TypeScript
}

// Smart folder detection untuk file placement
function getSmartFolderPath(filename, content, existingFolders = []) {
  const ext = filename.split('.').pop()?.toLowerCase();

  // Analisis content untuk menentukan folder yang tepat
  const isComponent = content.includes('export default function') ||
                     content.includes('function ') && content.includes('return');
  const isHook = filename.startsWith('use') || content.includes('export function use');
  const isType = filename.includes('.types.') || content.includes('interface ') || content.includes('type ');
  const isUtil = content.includes('export function') && !isComponent && !isHook;
  const isStyle = ['css', 'scss', 'sass'].includes(ext);
  const isTest = filename.includes('.test.') || filename.includes('.spec.');
  const isConfig = ['json', 'js', 'ts'].includes(ext) &&
                   (filename.includes('config') || filename.includes('.config') ||
                    filename === 'package.json' || filename === 'tsconfig.json');

  // Mapping folder berdasarkan jenis file
  const folderMap = {
    component: ['components', 'src/components', 'app/components'],
    hook: ['hooks', 'src/hooks', 'utils/hooks'],
    type: ['types', 'src/types', '@types'],
    util: ['utils', 'src/utils', 'lib'],
    style: ['styles', 'src/styles', 'css'],
    test: ['tests', '__tests__', 'src/__tests__'],
    config: ['', 'config'],
    asset: ['assets', 'public', 'static']
  };

  let fileType = 'util'; // default

  if (isComponent) fileType = 'component';
  else if (isHook) fileType = 'hook';
  else if (isType) fileType = 'type';
  else if (isStyle) fileType = 'style';
  else if (isTest) fileType = 'test';
  else if (isConfig) fileType = 'config';

  // Cari folder yang sudah ada dan cocok
  const preferredFolders = folderMap[fileType] || [''];

  for (const folder of preferredFolders) {
    if (folder === '') return filename; // root
    if (existingFolders.includes(folder)) {
      return `${folder}/${filename}`;
    }
  }

  // Jika tidak ada folder yang cocok, gunakan folder pertama dari preferensi
  const targetFolder = preferredFolders[0];
  if (targetFolder && targetFolder !== '') {
    return `${targetFolder}/${filename}`;
  }

  return filename; // fallback ke root
}

// Executor untuk menjalankan command AI
export function executeAICommands(commands, files, setFiles, setSelected, onNotification = null, folders = [], setFolders = null, setOpenTabs = null) {
  const executedCommands = [];

  commands.forEach(command => {
    let executed = false;
    let message = '';

    switch (command.type) {
      case 'create':
        // Use smart folder placement
        const smartPath = getSmartFolderPath(command.filename, command.content, folders);
        const finalFilename = smartPath;

        // Create folder if needed
        if (smartPath.includes('/') && setFolders) {
          const folderPath = smartPath.substring(0, smartPath.lastIndexOf('/'));
          const folderParts = folderPath.split('/');
          const newFolders = [];

          // Create all parent folders if they don't exist
          for (let i = 0; i < folderParts.length; i++) {
            const currentPath = folderParts.slice(0, i + 1).join('/');
            if (!folders.includes(currentPath)) {
              newFolders.push(currentPath);
            }
          }

          if (newFolders.length > 0) {
            setFolders(prev => [...prev, ...newFolders].sort());
          }
        }

        setFiles(f => ({ ...f, [finalFilename]: command.content }));
        setSelected(finalFilename);

        // Add to open tabs if function is provided
        if (setOpenTabs) {
          setOpenTabs(prev => prev.includes(finalFilename) ? prev : [...prev, finalFilename]);
        }

        executed = true;
        message = `${command.isExplicit ? '📝' : '✨'} Created file: ${finalFilename}`;
        break;

      case 'edit':
        if (files[command.filename] !== undefined) {
          setFiles(f => ({ ...f, [command.filename]: command.content }));
          setSelected(command.filename);
          executed = true;
          message = `${command.isExplicit ? '✏️' : '🔄'} Updated file: ${command.filename}`;
        } else {
          // File tidak ada, buat file baru dengan smart placement
          const smartPath = getSmartFolderPath(command.filename, command.content, folders);
          const finalFilename = smartPath;

          // Create folder if needed
          if (smartPath.includes('/') && setFolders) {
            const folderPath = smartPath.substring(0, smartPath.lastIndexOf('/'));
            const folderParts = folderPath.split('/');
            const newFolders = [];

            for (let i = 0; i < folderParts.length; i++) {
              const currentPath = folderParts.slice(0, i + 1).join('/');
              if (!folders.includes(currentPath)) {
                newFolders.push(currentPath);
              }
            }

            if (newFolders.length > 0) {
              setFolders(prev => [...prev, ...newFolders].sort());
            }
          }

          setFiles(f => ({ ...f, [finalFilename]: command.content }));
          setSelected(finalFilename);

          // Add to open tabs if function is provided
          if (setOpenTabs) {
            setOpenTabs(prev => prev.includes(finalFilename) ? prev : [...prev, finalFilename]);
          }

          executed = true;
          message = `${command.isExplicit ? '📝' : '✨'} Created file: ${finalFilename} (was missing)`;
        }
        break;

      case 'replace':
        if (files[command.filename] !== undefined) {
          const currentContent = files[command.filename];
          const newContent = currentContent.replace(
            new RegExp(command.oldText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
            command.newText
          );
          setFiles(f => ({ ...f, [command.filename]: newContent }));
          setSelected(command.filename);
          executed = true;
          message = `🔄 Replaced text in: ${command.filename}`;
        }
        break;

      case 'delete':
        if (files[command.filename] !== undefined && Object.keys(files).length > 1) {
          const { [command.filename]: _, ...rest } = files;
          setFiles(rest);
          setSelected(Object.keys(rest)[0]);
          executed = true;
          message = `🗑️ Deleted file: ${command.filename}`;
        }
        break;

      case 'rename':
        if (files[command.oldName] !== undefined && !files[command.newName]) {
          const { [command.oldName]: content, ...rest } = files;
          setFiles({ ...rest, [command.newName]: content });
          setSelected(command.newName);
          executed = true;
          message = `📝 Renamed: ${command.oldName} → ${command.newName}`;
        }
        break;
    }

    if (executed) {
      executedCommands.push({ ...command, message });

      // Kirim notification jika handler tersedia
      if (onNotification && message) {
        onNotification(message, command.isExplicit ? 'success' : 'info');
      }
    }
  });

  return executedCommands;
}

// Function untuk auto-complete/suggestion
export function getCodeSuggestions(language, context) {
  const suggestions = {
    javascript: [
      'console.log();',
      'function () {}',
      'const = ;',
      'if () {}',
      'for (let i = 0; i < ; i++) {}'
    ],
    python: [
      'print()',
      'def ():\n    pass',
      'if :\n    pass',
      'for i in range():\n    pass'
    ],
    markdown: [
      '# Heading',
      '## Subheading',
      '- List item',
      '[Link](url)',
      '```code```'
    ]
  };
  
  return suggestions[language] || [];
}
