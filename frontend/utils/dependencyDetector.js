// Auto-detect and suggest dependencies based on code content

export const commonDependencies = {
  // React ecosystem
  'react': { version: '^18.2.0', description: 'React library' },
  'react-dom': { version: '^18.2.0', description: 'React DOM' },
  'next': { version: '^14.0.0', description: 'Next.js framework' },
  'typescript': { version: '^5.0.0', description: 'TypeScript compiler', dev: true },
  '@types/react': { version: '^18.0.0', description: 'React types', dev: true },
  '@types/node': { version: '^20.0.0', description: 'Node.js types', dev: true },
  
  // Styling
  'tailwindcss': { version: '^3.3.0', description: 'Utility-first CSS framework', dev: true },
  'autoprefixer': { version: '^10.4.0', description: 'PostCSS plugin', dev: true },
  'postcss': { version: '^8.4.0', description: 'CSS processor', dev: true },
  'styled-components': { version: '^6.0.0', description: 'CSS-in-JS library' },
  'emotion': { version: '^11.0.0', description: 'CSS-in-JS library' },
  
  // State management
  'zustand': { version: '^4.4.0', description: 'Simple state management' },
  'redux': { version: '^4.2.0', description: 'Predictable state container' },
  '@reduxjs/toolkit': { version: '^1.9.0', description: 'Redux toolkit' },
  'jotai': { version: '^2.0.0', description: 'Atomic state management' },
  
  // Utilities
  'axios': { version: '^1.6.0', description: 'HTTP client' },
  'lodash': { version: '^4.17.0', description: 'Utility library' },
  'date-fns': { version: '^2.30.0', description: 'Date utility library' },
  'uuid': { version: '^9.0.0', description: 'UUID generator' },
  'clsx': { version: '^2.0.0', description: 'Class name utility' },
  
  // UI Components
  'react-icons': { version: '^4.12.0', description: 'React icon library' },
  'framer-motion': { version: '^10.0.0', description: 'Animation library' },
  'react-spring': { version: '^9.7.0', description: 'Spring animation library' },
  'lucide-react': { version: '^0.294.0', description: 'Lucide icon library' },
  
  // Testing
  'jest': { version: '^29.0.0', description: 'Testing framework', dev: true },
  '@testing-library/react': { version: '^13.0.0', description: 'React testing utilities', dev: true },
  '@testing-library/jest-dom': { version: '^6.0.0', description: 'Jest DOM matchers', dev: true },
  'vitest': { version: '^0.34.0', description: 'Fast testing framework', dev: true },
  
  // Linting & Formatting
  'eslint': { version: '^8.0.0', description: 'JavaScript linter', dev: true },
  'prettier': { version: '^3.0.0', description: 'Code formatter', dev: true },
  '@typescript-eslint/eslint-plugin': { version: '^6.0.0', description: 'TypeScript ESLint rules', dev: true },
  
  // Build tools
  'vite': { version: '^4.0.0', description: 'Build tool', dev: true },
  'webpack': { version: '^5.0.0', description: 'Module bundler', dev: true },
  'rollup': { version: '^4.0.0', description: 'Module bundler', dev: true }
};

export const detectionPatterns = {
  // React patterns
  'react': [
    /import.*React/,
    /from ['"]react['"]/,
    /React\./,
    /<[A-Z]/,
    /jsx/i
  ],
  'react-dom': [
    /ReactDOM/,
    /from ['"]react-dom['"]/,
    /createRoot/,
    /render\(/
  ],
  'next': [
    /from ['"]next/,
    /next\/head/,
    /next\/image/,
    /next\/router/,
    /getServerSideProps/,
    /getStaticProps/
  ],
  
  // Styling
  'tailwindcss': [
    /className=['"][^'"]*(?:bg-|text-|p-|m-|flex|grid)/,
    /tailwind/i,
    /@apply/,
    /@tailwind/
  ],
  'styled-components': [
    /styled\./,
    /from ['"]styled-components['"]/,
    /css`/,
    /styled\(/
  ],
  
  // State management
  'zustand': [
    /from ['"]zustand['"]/,
    /create\(/,
    /useStore/
  ],
  'redux': [
    /from ['"]redux['"]/,
    /createStore/,
    /useSelector/,
    /useDispatch/
  ],
  
  // HTTP clients
  'axios': [
    /from ['"]axios['"]/,
    /axios\./,
    /\.get\(/,
    /\.post\(/
  ],
  
  // Utilities
  'lodash': [
    /from ['"]lodash['"]/,
    /_\./,
    /import.*_.*from ['"]lodash['"]/
  ],
  'uuid': [
    /from ['"]uuid['"]/,
    /v4\(\)/,
    /uuidv4/
  ],
  
  // Icons
  'react-icons': [
    /from ['"]react-icons/,
    /Hi[A-Z]/,
    /Fa[A-Z]/,
    /Md[A-Z]/
  ],
  
  // Animation
  'framer-motion': [
    /from ['"]framer-motion['"]/,
    /motion\./,
    /animate=/,
    /variants=/
  ],
  
  // TypeScript
  'typescript': [
    /\.tsx?$/,
    /interface /,
    /type /,
    /: string/,
    /: number/,
    /: boolean/
  ]
};

export function detectDependencies(files) {
  const detected = new Set();
  
  Object.entries(files).forEach(([filename, content]) => {
    // Check file extensions
    if (filename.endsWith('.tsx') || filename.endsWith('.ts')) {
      detected.add('typescript');
      detected.add('@types/react');
      detected.add('@types/node');
    }
    
    if (filename.endsWith('.jsx') || filename.endsWith('.tsx')) {
      detected.add('react');
      detected.add('react-dom');
    }
    
    // Check content patterns
    Object.entries(detectionPatterns).forEach(([dep, patterns]) => {
      patterns.forEach(pattern => {
        if (pattern.test(content)) {
          detected.add(dep);
        }
      });
    });
  });
  
  return Array.from(detected);
}

export function generatePackageJson(projectName, detectedDeps, additionalDeps = []) {
  const allDeps = [...detectedDeps, ...additionalDeps];
  const dependencies = {};
  const devDependencies = {};
  
  allDeps.forEach(dep => {
    const info = commonDependencies[dep];
    if (info) {
      if (info.dev) {
        devDependencies[dep] = info.version;
      } else {
        dependencies[dep] = info.version;
      }
    }
  });
  
  return {
    name: projectName.toLowerCase().replace(/\s+/g, '-'),
    version: '1.0.0',
    private: true,
    scripts: {
      dev: 'next dev',
      build: 'next build',
      start: 'next start',
      lint: 'eslint . --ext .js,.jsx,.ts,.tsx',
      'lint:fix': 'eslint . --ext .js,.jsx,.ts,.tsx --fix',
      format: 'prettier --write "**/*.{js,jsx,ts,tsx,json,css,md}"',
      test: 'jest',
      'test:watch': 'jest --watch'
    },
    dependencies,
    devDependencies,
    engines: {
      node: '>=18.0.0'
    }
  };
}

export function getSuggestedDependencies(detectedDeps) {
  const suggestions = [];
  
  // Always suggest common tools
  const commonTools = ['prettier', 'eslint', 'tailwindcss', 'typescript'];
  commonTools.forEach(tool => {
    if (!detectedDeps.includes(tool)) {
      suggestions.push({
        name: tool,
        reason: 'Recommended for better development experience',
        ...commonDependencies[tool]
      });
    }
  });
  
  // Suggest based on what's detected
  if (detectedDeps.includes('react') && !detectedDeps.includes('react-icons')) {
    suggestions.push({
      name: 'react-icons',
      reason: 'Great icon library for React projects',
      ...commonDependencies['react-icons']
    });
  }
  
  if (detectedDeps.includes('react') && !detectedDeps.includes('framer-motion')) {
    suggestions.push({
      name: 'framer-motion',
      reason: 'Smooth animations for React components',
      ...commonDependencies['framer-motion']
    });
  }
  
  return suggestions;
}