// Smart Package Management System
class SmartPackageManager {
  constructor() {
    this.packageRegistry = new Map();
    this.missingImports = new Set();
    this.installedPackages = new Map();
    this.dependencyGraph = new Map();
    
    // Initialize with common packages
    this.initializeCommonPackages();
  }
  
  initializeCommonPackages() {
    const commonPackages = {
      // React ecosystem
      'react': { version: '^18.0.0', type: 'dependency', description: 'React library' },
      'react-dom': { version: '^18.0.0', type: 'dependency', description: 'React DOM' },
      'react-router-dom': { version: '^6.0.0', type: 'dependency', description: 'React Router' },
      'react-query': { version: '^4.0.0', type: 'dependency', description: 'Data fetching' },
      'react-hook-form': { version: '^7.0.0', type: 'dependency', description: 'Form handling' },
      
      // State management
      'zustand': { version: '^4.0.0', type: 'dependency', description: 'State management' },
      'redux': { version: '^4.0.0', type: 'dependency', description: 'Redux state management' },
      '@reduxjs/toolkit': { version: '^1.9.0', type: 'dependency', description: 'Redux Toolkit' },
      
      // Styling
      'tailwindcss': { version: '^3.0.0', type: 'devDependency', description: 'Utility-first CSS' },
      'styled-components': { version: '^5.3.0', type: 'dependency', description: 'CSS-in-JS' },
      'emotion': { version: '^11.0.0', type: 'dependency', description: 'CSS-in-JS' },
      
      // Icons
      'react-icons': { version: '^4.0.0', type: 'dependency', description: 'Icon library' },
      'heroicons': { version: '^2.0.0', type: 'dependency', description: 'Heroicons' },
      'lucide-react': { version: '^0.263.0', type: 'dependency', description: 'Lucide icons' },
      
      // Utilities
      'lodash': { version: '^4.17.0', type: 'dependency', description: 'Utility library' },
      'date-fns': { version: '^2.29.0', type: 'dependency', description: 'Date utilities' },
      'axios': { version: '^1.0.0', type: 'dependency', description: 'HTTP client' },
      'clsx': { version: '^1.2.0', type: 'dependency', description: 'Class name utility' },
      
      // TypeScript
      'typescript': { version: '^5.0.0', type: 'devDependency', description: 'TypeScript' },
      '@types/react': { version: '^18.0.0', type: 'devDependency', description: 'React types' },
      '@types/react-dom': { version: '^18.0.0', type: 'devDependency', description: 'React DOM types' },
      '@types/node': { version: '^20.0.0', type: 'devDependency', description: 'Node.js types' },
      
      // Development tools
      'vite': { version: '^4.0.0', type: 'devDependency', description: 'Build tool' },
      'eslint': { version: '^8.0.0', type: 'devDependency', description: 'Linter' },
      'prettier': { version: '^3.0.0', type: 'devDependency', description: 'Code formatter' },
      'vitest': { version: '^0.34.0', type: 'devDependency', description: 'Testing framework' },
      
      // Next.js
      'next': { version: '^13.0.0', type: 'dependency', description: 'Next.js framework' }
    };
    
    Object.entries(commonPackages).forEach(([name, info]) => {
      this.packageRegistry.set(name, info);
    });
  }
  
  // Detect missing imports from code
  detectMissingImports(content, filename) {
    const imports = this.extractImports(content);
    const missing = [];
    
    imports.forEach(importInfo => {
      const packageName = this.getPackageName(importInfo.source);
      if (packageName && !this.isPackageInstalled(packageName)) {
        missing.push({
          packageName,
          importPath: importInfo.source,
          importNames: importInfo.names,
          filename,
          suggestion: this.getSuggestion(packageName)
        });
      }
    });
    
    return missing;
  }
  
  // Extract import statements from code
  extractImports(content) {
    const imports = [];
    
    // ES6 imports
    const importRegex = /import\s+(?:(\w+)|{([^}]+)}|\*\s+as\s+(\w+))\s+from\s+['"]([^'"]+)['"]/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      const [_, defaultImport, namedImports, namespaceImport, source] = match;
      
      let names = [];
      if (defaultImport) names.push(defaultImport);
      if (namedImports) names.push(...namedImports.split(',').map(name => name.trim()));
      if (namespaceImport) names.push(namespaceImport);
      
      imports.push({
        source: source.trim(),
        names,
        type: 'es6'
      });
    }
    
    // CommonJS require
    const requireRegex = /(?:const|let|var)\s+(?:(\w+)|{([^}]+)})\s*=\s*require\(['"]([^'"]+)['"]\)/g;
    
    while ((match = requireRegex.exec(content)) !== null) {
      const [_, defaultImport, namedImports, source] = match;
      
      let names = [];
      if (defaultImport) names.push(defaultImport);
      if (namedImports) names.push(...namedImports.split(',').map(name => name.trim()));
      
      imports.push({
        source: source.trim(),
        names,
        type: 'commonjs'
      });
    }
    
    return imports;
  }
  
  // Get package name from import path
  getPackageName(importPath) {
    if (importPath.startsWith('./') || importPath.startsWith('../')) {
      return null; // Relative import
    }
    
    if (importPath.startsWith('@')) {
      // Scoped package
      const parts = importPath.split('/');
      return parts.slice(0, 2).join('/');
    }
    
    // Regular package
    return importPath.split('/')[0];
  }
  
  // Check if package is installed
  isPackageInstalled(packageName) {
    return this.installedPackages.has(packageName) || 
           this.packageRegistry.has(packageName);
  }
  
  // Get package suggestion
  getSuggestion(packageName) {
    if (this.packageRegistry.has(packageName)) {
      return this.packageRegistry.get(packageName);
    }
    
    // Smart suggestions based on patterns
    const suggestions = {
      'moment': { 
        alternative: 'date-fns', 
        reason: 'date-fns is smaller and tree-shakable' 
      },
      'jquery': { 
        alternative: 'vanilla JS', 
        reason: 'Modern frameworks don\'t need jQuery' 
      },
      'bootstrap': { 
        alternative: 'tailwindcss', 
        reason: 'Tailwind is more flexible and modern' 
      }
    };
    
    return suggestions[packageName] || {
      version: 'latest',
      type: 'dependency',
      description: `Auto-detected package: ${packageName}`
    };
  }
  
  // Auto-install missing packages
  async autoInstallPackages(missingPackages, onProgress) {
    const installQueue = [];
    
    missingPackages.forEach(pkg => {
      if (!installQueue.find(p => p.name === pkg.packageName)) {
        installQueue.push({
          name: pkg.packageName,
          ...pkg.suggestion
        });
      }
    });
    
    const results = [];
    
    for (const pkg of installQueue) {
      if (onProgress) {
        onProgress(`Installing ${pkg.name}...`);
      }
      
      try {
        const result = await this.installPackage(pkg);
        results.push(result);
        
        if (onProgress) {
          onProgress(`✅ Installed ${pkg.name}`);
        }
      } catch (error) {
        results.push({
          name: pkg.name,
          success: false,
          error: error.message
        });
        
        if (onProgress) {
          onProgress(`❌ Failed to install ${pkg.name}: ${error.message}`);
        }
      }
    }
    
    return results;
  }
  
  // Install single package (simulated)
  async installPackage(pkg) {
    // Simulate installation delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // In real implementation, this would:
    // 1. Add to package.json
    // 2. Run npm/yarn install
    // 3. Update dependencies
    
    this.installedPackages.set(pkg.name, {
      version: pkg.version,
      type: pkg.type,
      installDate: new Date(),
      autoInstalled: true
    });
    
    return {
      name: pkg.name,
      version: pkg.version,
      success: true,
      installTime: Date.now()
    };
  }
  
  // Generate package.json
  generatePackageJson(projectName = 'my-project') {
    const dependencies = {};
    const devDependencies = {};
    
    this.installedPackages.forEach((info, name) => {
      if (info.type === 'devDependency') {
        devDependencies[name] = info.version;
      } else {
        dependencies[name] = info.version;
      }
    });
    
    return {
      name: projectName,
      version: '1.0.0',
      private: true,
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview',
        lint: 'eslint src',
        format: 'prettier --write src',
        test: 'vitest'
      },
      dependencies,
      devDependencies,
      engines: {
        node: '>=18.0.0'
      }
    };
  }
  
  // Check for package updates
  async checkUpdates() {
    const updates = [];
    
    for (const [name, info] of this.installedPackages) {
      // Simulate checking for updates
      const hasUpdate = Math.random() > 0.7; // 30% chance of update
      
      if (hasUpdate) {
        const currentVersion = info.version;
        const latestVersion = this.generateNewVersion(currentVersion);
        
        updates.push({
          name,
          currentVersion,
          latestVersion,
          type: this.getUpdateType(currentVersion, latestVersion)
        });
      }
    }
    
    return updates;
  }
  
  generateNewVersion(current) {
    const parts = current.replace(/[^0-9.]/g, '').split('.');
    const major = parseInt(parts[0]) || 0;
    const minor = parseInt(parts[1]) || 0;
    const patch = parseInt(parts[2]) || 0;
    
    // Randomly increment patch, minor, or major
    const updateType = Math.random();
    if (updateType < 0.7) {
      return `${major}.${minor}.${patch + 1}`;
    } else if (updateType < 0.9) {
      return `${major}.${minor + 1}.0`;
    } else {
      return `${major + 1}.0.0`;
    }
  }
  
  getUpdateType(current, latest) {
    const currentParts = current.replace(/[^0-9.]/g, '').split('.').map(Number);
    const latestParts = latest.split('.').map(Number);
    
    if (latestParts[0] > currentParts[0]) return 'major';
    if (latestParts[1] > currentParts[1]) return 'minor';
    return 'patch';
  }
  
  // Resolve dependency conflicts
  resolveDependencyConflicts(packages) {
    const conflicts = [];
    const resolved = new Map();
    
    packages.forEach(pkg => {
      if (resolved.has(pkg.name)) {
        const existing = resolved.get(pkg.name);
        const conflict = {
          package: pkg.name,
          versions: [existing.version, pkg.version],
          resolution: this.resolveVersionConflict(existing.version, pkg.version)
        };
        conflicts.push(conflict);
        resolved.set(pkg.name, { ...pkg, version: conflict.resolution });
      } else {
        resolved.set(pkg.name, pkg);
      }
    });
    
    return {
      conflicts,
      resolved: Array.from(resolved.values())
    };
  }
  
  resolveVersionConflict(v1, v2) {
    // Simple resolution: use the higher version
    const compare = this.compareVersions(v1, v2);
    return compare > 0 ? v1 : v2;
  }
  
  compareVersions(v1, v2) {
    const parts1 = v1.replace(/[^0-9.]/g, '').split('.').map(Number);
    const parts2 = v2.replace(/[^0-9.]/g, '').split('.').map(Number);
    
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const part1 = parts1[i] || 0;
      const part2 = parts2[i] || 0;
      
      if (part1 > part2) return 1;
      if (part1 < part2) return -1;
    }
    
    return 0;
  }
  
  // Get package stats
  getPackageStats() {
    const total = this.installedPackages.size;
    const dependencies = Array.from(this.installedPackages.values())
      .filter(pkg => pkg.type === 'dependency').length;
    const devDependencies = total - dependencies;
    const autoInstalled = Array.from(this.installedPackages.values())
      .filter(pkg => pkg.autoInstalled).length;
    
    return {
      total,
      dependencies,
      devDependencies,
      autoInstalled
    };
  }
}

// Export singleton instance
export const packageManager = new SmartPackageManager();

// Export hook for React components
export function usePackageManager() {
  return {
    detectMissingImports: (content, filename) => 
      packageManager.detectMissingImports(content, filename),
    
    autoInstallPackages: (missing, onProgress) => 
      packageManager.autoInstallPackages(missing, onProgress),
    
    generatePackageJson: (projectName) => 
      packageManager.generatePackageJson(projectName),
    
    checkUpdates: () => 
      packageManager.checkUpdates(),
    
    getPackageStats: () => 
      packageManager.getPackageStats(),
    
    installPackage: (pkg) => 
      packageManager.installPackage(pkg)
  };
}
