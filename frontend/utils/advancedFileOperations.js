// Enhanced file operations with smart templates and auto-organization

export function smartFileCreation(filename, files, setFiles, setSelected, showNotification, setOpenTabs = null) {
  const { isValid, autoExtension, template } = validateAndEnhanceFileName(filename, files);
  
  if (!isValid) {
    showNotification('Invalid filename', 'error');
    return;
  }

  const finalName = autoExtension ? filename + autoExtension : filename;
  const smartTemplate = generateSmartTemplate(finalName, files);
  
  setFiles(prev => ({ ...prev, [finalName]: smartTemplate }));
  setSelected(finalName);

  // Add to open tabs if function is provided
  if (setOpenTabs) {
    setOpenTabs(prev => prev.includes(finalName) ? prev : [...prev, finalName]);
  }

  showNotification(`Created ${finalName} with smart template`, 'success');
  
  // Auto-organize if needed
  const organizationSuggestion = analyzeProjectStructure(files);
  if (organizationSuggestion.shouldReorganize) {
    showNotification(organizationSuggestion.message, 'info');
  }
}

export function validateAndEnhanceFileName(name, existingFiles = {}) {
  if (!name || name.trim() === '') {
    return { isValid: false, error: 'Filename cannot be empty' };
  }

  const trimmedName = name.trim();
  
  // Check for invalid characters
  const invalidChars = /[<>:"/\\|?*]/;
  if (invalidChars.test(trimmedName)) {
    return { isValid: false, error: 'Invalid characters in filename' };
  }

  // Auto-detect extension if missing
  const hasExtension = trimmedName.includes('.') && !trimmedName.endsWith('.');
  if (!hasExtension) {
    const suggestedExtension = autoDetectExtension(trimmedName);
    return {
      isValid: true,
      autoExtension: suggestedExtension,
      suggestions: [
        trimmedName + suggestedExtension,
        trimmedName + '.tsx',
        trimmedName + '.ts',
        trimmedName + '.jsx',
        trimmedName + '.js'
      ]
    };
  }

  // Check if file already exists
  if (existingFiles[trimmedName]) {
    return { isValid: false, error: 'File already exists' };
  }

  return { isValid: true };
}

function autoDetectExtension(filename) {
  const lower = filename.toLowerCase();
  
  // Component detection
  if (lower.includes('component') || 
      lower.includes('button') || 
      lower.includes('modal') || 
      lower.includes('card') ||
      lower.includes('form') ||
      lower.includes('input') ||
      lower.includes('header') ||
      lower.includes('footer') ||
      lower.includes('nav') ||
      lower.includes('sidebar')) {
    return '.tsx';
  }
  
  // Hook detection
  if (lower.startsWith('use') || lower.includes('hook')) {
    return '.ts';
  }
  
  // Test detection
  if (lower.includes('test') || lower.includes('spec')) {
    return '.test.tsx';
  }
  
  // Style detection
  if (lower.includes('style') || lower.includes('css') || lower.includes('theme')) {
    return '.css';
  }
  
  // Utility detection
  if (lower.includes('util') || lower.includes('helper') || lower.includes('lib')) {
    return '.ts';
  }
  
  // API detection
  if (lower.includes('api') || lower.includes('service') || lower.includes('client')) {
    return '.ts';
  }
  
  // Page detection
  if (lower.includes('page') || lower.includes('route')) {
    return '.tsx';
  }
  
  // Config detection
  if (lower.includes('config') || lower.includes('setting')) {
    return '.ts';
  }
  
  // Type detection
  if (lower.includes('type') || lower.includes('interface') || lower.includes('model')) {
    return '.ts';
  }
  
  // Default to TypeScript React component
  return '.tsx';
}

export function generateSmartTemplate(filename, existingFiles = {}) {
  const extension = filename.split('.').pop()?.toLowerCase();
  const baseName = filename.split('/').pop()?.split('.')[0] || 'Component';
  const componentName = capitalize(toCamelCase(baseName));
  
  const projectContext = analyzeProjectContext(existingFiles);
  
  switch (extension) {
    case 'tsx':
      return generateReactComponentTemplate(componentName, projectContext);
    
    case 'ts':
      if (baseName.startsWith('use') || baseName.includes('hook')) {
        return generateHookTemplate(componentName, projectContext);
      } else if (baseName.includes('util') || baseName.includes('helper')) {
        return generateUtilityTemplate(componentName, projectContext);
      } else if (baseName.includes('service') || baseName.includes('api')) {
        return generateServiceTemplate(componentName, projectContext);
      } else if (baseName.includes('type') || baseName.includes('interface')) {
        return generateTypeTemplate(componentName, projectContext);
      }
      return generateTypeScriptTemplate(componentName, projectContext);
    
    case 'jsx':
      return generateReactComponentTemplate(componentName, projectContext, false);
    
    case 'js':
      return generateJavaScriptTemplate(componentName, projectContext);
    
    case 'css':
      return generateCSSTemplate(componentName, projectContext);
    
    case 'scss':
      return generateSCSSTemplate(componentName, projectContext);
    
    case 'md':
      return generateMarkdownTemplate(baseName, projectContext);
    
    case 'json':
      return generateJSONTemplate(baseName, projectContext);
    
    case 'html':
      return generateHTMLTemplate(componentName, projectContext);
    
    default:
      return generateDefaultTemplate(filename, projectContext);
  }
}

function generateReactComponentTemplate(componentName, context, useTypeScript = true) {
  const imports = useTypeScript ? 
    "import React from 'react';" :
    "import React from 'react';";
  
  const interfaceDefinition = useTypeScript ? `
interface ${componentName}Props {
  className?: string;
  children?: React.ReactNode;
}` : '';

  const propsType = useTypeScript ? `: ${componentName}Props` : '';
  const destructuring = useTypeScript ? '{ className, children }' : '{ className, children }';

  return `${imports}${interfaceDefinition}

export default function ${componentName}(${destructuring}${propsType}) {
  return (
    <div className={\`${componentName.toLowerCase()}\${className ? \` \${className}\` : ''}\`}>
      <h2>${componentName}</h2>
      {children}
    </div>
  );
}`;
}

function generateHookTemplate(hookName, context) {
  const cleanHookName = hookName.startsWith('use') ? hookName : `use${hookName}`;
  
  return `import { useState, useEffect } from 'react';

export function ${cleanHookName}() {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Hook logic here
    setLoading(false);
  }, []);

  return {
    state,
    setState,
    loading,
    error
  };
}`;
}

function generateUtilityTemplate(utilName, context) {
  return `// ${utilName} utilities

export function ${toCamelCase(utilName)}(input: any): any {
  // Utility function implementation
  return input;
}

export function format${utilName}(value: string): string {
  return value.trim().toLowerCase();
}

export function validate${utilName}(value: any): boolean {
  return value != null && value !== '';
}

export default {
  ${toCamelCase(utilName)},
  format${utilName},
  validate${utilName}
};`;
}

function generateServiceTemplate(serviceName, context) {
  return `// ${serviceName} service

class ${serviceName}Service {
  private baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  async get(endpoint: string): Promise<any> {
    try {
      const response = await fetch(\`\${this.baseURL}/\${endpoint}\`);
      if (!response.ok) {
        throw new Error(\`HTTP error! status: \${response.status}\`);
      }
      return await response.json();
    } catch (error) {
      console.error('Service error:', error);
      throw error;
    }
  }

  async post(endpoint: string, data: any): Promise<any> {
    try {
      const response = await fetch(\`\${this.baseURL}/\${endpoint}\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(\`HTTP error! status: \${response.status}\`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Service error:', error);
      throw error;
    }
  }
}

export const ${toCamelCase(serviceName)}Service = new ${serviceName}Service();
export default ${serviceName}Service;`;
}

function generateTypeTemplate(typeName, context) {
  return `// ${typeName} type definitions

export interface ${typeName} {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ${typeName}Input {
  name: string;
}

export interface ${typeName}Response {
  data: ${typeName};
  success: boolean;
  message?: string;
}

export type ${typeName}Status = 'active' | 'inactive' | 'pending';

export type ${typeName}Actions = 
  | { type: 'CREATE'; payload: ${typeName}Input }
  | { type: 'UPDATE'; payload: Partial<${typeName}> }
  | { type: 'DELETE'; payload: string };`;
}

function generateCSSTemplate(componentName, context) {
  const className = componentName.toLowerCase();
  
  return `.${className} {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.${className}:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.${className} h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.${className}--variant {
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
}

.${className}--compact {
  padding: 0.5rem;
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .${className} {
    padding: 0.75rem;
    border-radius: 6px;
  }
}`;
}

function generateMarkdownTemplate(fileName, context) {
  const title = fileName.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  return `# ${title}

## Overview

Brief description of ${title}.

## Features

- Feature 1
- Feature 2
- Feature 3

## Usage

\`\`\`javascript
// Example usage
import { ${toCamelCase(fileName)} } from './${fileName}';

const result = ${toCamelCase(fileName)}();
\`\`\`

## API Reference

### Methods

#### \`method()\`

Description of the method.

**Parameters:**
- \`param1\` (string): Description
- \`param2\` (boolean): Description

**Returns:** Description of return value

## Examples

\`\`\`javascript
// Example 1
const example1 = ${toCamelCase(fileName)}({
  param1: 'value',
  param2: true
});

// Example 2
const example2 = ${toCamelCase(fileName)}();
\`\`\`

## License

MIT`;
}

function generateJSONTemplate(fileName, context) {
  if (fileName.includes('package')) {
    return `{
  "name": "${fileName}",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {},
  "devDependencies": {}
}`;
  }
  
  if (fileName.includes('config')) {
    return `{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}`;
  }
  
  return `{
  "data": [],
  "meta": {
    "version": "1.0.0",
    "created": "${new Date().toISOString()}"
  }
}`;
}

function generateDefaultTemplate(fileName, context) {
  return `// ${fileName}
// Created: ${new Date().toLocaleDateString()}

// TODO: Add implementation
`;
}

function analyzeProjectContext(files) {
  const context = {
    hasReact: false,
    hasTypeScript: false,
    hasNextJS: false,
    hasTailwind: false,
    testingFramework: null,
    mainTech: 'react'
  };
  
  const fileNames = Object.keys(files);
  
  // Detect React
  context.hasReact = fileNames.some(f => f.endsWith('.jsx') || f.endsWith('.tsx'));
  
  // Detect TypeScript
  context.hasTypeScript = fileNames.some(f => f.endsWith('.ts') || f.endsWith('.tsx'));
  
  // Detect Next.js
  context.hasNextJS = fileNames.some(f => f.includes('pages/') || f.includes('_app.'));
  
  // Detect testing framework
  if (fileNames.some(f => f.includes('.test.') || f.includes('.spec.'))) {
    context.testingFramework = 'jest';
  }
  
  return context;
}

export function analyzeProjectStructure(files) {
  const fileNames = Object.keys(files);
  const suggestions = [];
  let shouldReorganize = false;
  
  // Check for files that should be in folders
  const rootFiles = fileNames.filter(f => !f.includes('/'));
  const componentFiles = rootFiles.filter(f => 
    f.endsWith('.tsx') || f.endsWith('.jsx') && 
    !f.startsWith('_') && 
    !f.includes('page') && 
    !f.includes('app')
  );
  
  if (componentFiles.length > 3) {
    suggestions.push('Consider organizing components in a "components/" folder');
    shouldReorganize = true;
  }
  
  // Check for utils
  const utilFiles = rootFiles.filter(f => 
    f.includes('util') || f.includes('helper') || f.includes('lib')
  );
  
  if (utilFiles.length > 2) {
    suggestions.push('Consider organizing utilities in a "utils/" folder');
    shouldReorganize = true;
  }
  
  // Check for styles
  const styleFiles = rootFiles.filter(f => 
    f.endsWith('.css') || f.endsWith('.scss') || f.endsWith('.sass')
  );
  
  if (styleFiles.length > 2) {
    suggestions.push('Consider organizing styles in a "styles/" folder');
    shouldReorganize = true;
  }
  
  return {
    shouldReorganize,
    suggestions,
    message: suggestions.length > 0 ? suggestions[0] : null
  };
}

// Helper functions
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function toCamelCase(str) {
  return str.replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '');
}

function toKebabCase(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

export function createAdvancedFileManager(files, setFiles, setSelected, showNotification) {
  return {
    createFile: (name, folder = null) => smartFileCreation(
      folder ? `${folder}/${name}` : name, 
      files, 
      setFiles, 
      setSelected, 
      showNotification
    ),
    
    duplicateFile: (originalName, newName) => {
      if (files[originalName] && !files[newName]) {
        setFiles(prev => ({
          ...prev,
          [newName]: prev[originalName]
        }));
        showNotification(`Duplicated ${originalName} to ${newName}`, 'success');
      }
    },
    
    renameFile: (oldName, newName) => {
      if (files[oldName] && !files[newName]) {
        const { [oldName]: content, ...rest } = files;
        setFiles({ ...rest, [newName]: content });
        if (setSelected) setSelected(newName);
        showNotification(`Renamed ${oldName} to ${newName}`, 'success');
      }
    },
    
    organizeProject: () => {
      const analysis = analyzeProjectStructure(files);
      if (analysis.shouldReorganize) {
        showNotification('Project reorganization suggestions available', 'info');
        return analysis.suggestions;
      }
      return [];
    }
  };
}
