import React, { useState, useEffect } from 'react';
import { HiCube, HiArrowDownTray, HiCheckCircle, HiXCircle, HiExclamationTriangle, HiCog6Tooth, HiSparkles } from 'react-icons/hi2';
import { usePackageManager } from '../utils/packageManager';

export default function PackageManager({ files, showNotification, isOpen, onClose }) {
  const [missingPackages, setMissingPackages] = useState([]);
  const [installing, setInstalling] = useState(false);
  const [installProgress, setInstallProgress] = useState('');
  const [updates, setUpdates] = useState([]);
  const [stats, setStats] = useState({ total: 0, dependencies: 0, devDependencies: 0, autoInstalled: 0 });
  const [activeTab, setActiveTab] = useState('missing');
  
  const { detectMissingImports, autoInstallPackages, generatePackageJson, checkUpdates, getPackageStats } = usePackageManager();
  
  useEffect(() => {
    if (isOpen) {
      scanForMissingPackages();
      loadStats();
      loadUpdates();
    }
  }, [isOpen, files]);
  
  const scanForMissingPackages = () => {
    const missing = [];
    
    Object.entries(files).forEach(([filename, content]) => {
      if (filename.endsWith('.js') || filename.endsWith('.jsx') || filename.endsWith('.ts') || filename.endsWith('.tsx')) {
        const fileMissing = detectMissingImports(content, filename);
        missing.push(...fileMissing);
      }
    });
    
    // Remove duplicates
    const uniqueMissing = missing.filter((pkg, index, self) => 
      index === self.findIndex(p => p.packageName === pkg.packageName)
    );
    
    setMissingPackages(uniqueMissing);
  };
  
  const loadStats = () => {
    const packageStats = getPackageStats();
    setStats(packageStats);
  };
  
  const loadUpdates = async () => {
    try {
      const availableUpdates = await checkUpdates();
      setUpdates(availableUpdates);
    } catch (error) {
      console.error('Failed to check updates:', error);
    }
  };
  
  const handleAutoInstall = async () => {
    if (missingPackages.length === 0) return;
    
    setInstalling(true);
    setInstallProgress('Starting installation...');
    
    try {
      const results = await autoInstallPackages(missingPackages, (progress) => {
        setInstallProgress(progress);
      });
      
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);
      
      if (successful.length > 0) {
        showNotification(`✅ Installed ${successful.length} packages successfully!`, 'success');
      }
      
      if (failed.length > 0) {
        showNotification(`❌ Failed to install ${failed.length} packages`, 'error');
      }
      
      // Refresh data
      scanForMissingPackages();
      loadStats();
      
    } catch (error) {
      showNotification('Installation failed: ' + error.message, 'error');
    } finally {
      setInstalling(false);
      setInstallProgress('');
    }
  };
  
  const downloadPackageJson = () => {
    try {
      const packageJson = generatePackageJson('my-claude-project');
      const blob = new Blob([JSON.stringify(packageJson, null, 2)], { 
        type: 'application/json' 
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'package.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showNotification('package.json downloaded successfully!', 'success');
    } catch (error) {
      showNotification('Failed to generate package.json', 'error');
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 w-full max-w-4xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <HiCube className="text-white w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Smart Package Manager</h2>
              <p className="text-sm text-slate-400">Auto-detect and manage dependencies</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <HiXCircle className="w-5 h-5" />
          </button>
        </div>
        
        {/* Stats Bar */}
        <div className="px-6 py-4 bg-slate-900/50 border-b border-slate-700">
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{stats.total}</div>
              <div className="text-xs text-slate-400">Total Packages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{stats.dependencies}</div>
              <div className="text-xs text-slate-400">Dependencies</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{stats.devDependencies}</div>
              <div className="text-xs text-slate-400">Dev Dependencies</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{stats.autoInstalled}</div>
              <div className="text-xs text-slate-400">Auto-Installed</div>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-slate-700">
          {[
            { id: 'missing', label: 'Missing Packages', count: missingPackages.length },
            { id: 'updates', label: 'Updates Available', count: updates.length },
            { id: 'actions', label: 'Actions', count: null }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-400 border-blue-400'
                  : 'text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              {tab.label}
              {tab.count !== null && tab.count > 0 && (
                <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
        
        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {activeTab === 'missing' && (
            <div>
              {missingPackages.length === 0 ? (
                <div className="text-center py-8">
                  <HiCheckCircle className="mx-auto w-12 h-12 text-green-400 mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">All packages are available!</h3>
                  <p className="text-slate-400">No missing dependencies detected in your code.</p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-white">Missing Packages ({missingPackages.length})</h3>
                    <button
                      onClick={handleAutoInstall}
                      disabled={installing}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      {installing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                          Installing...
                        </>
                      ) : (
                        <>
                          <HiSparkles className="w-4 h-4" />
                          Auto-Install All
                        </>
                      )}
                    </button>
                  </div>
                  
                  {installing && installProgress && (
                    <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <div className="text-blue-400 text-sm">{installProgress}</div>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    {missingPackages.map((pkg, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <HiCube className="w-4 h-4 text-blue-400" />
                            <span className="font-medium text-white">{pkg.packageName}</span>
                            <span className="text-xs px-2 py-1 bg-slate-600 text-slate-300 rounded">
                              {pkg.suggestion.type}
                            </span>
                          </div>
                          <div className="text-sm text-slate-400 mt-1">
                            Used in: {pkg.filename} • {pkg.suggestion.description}
                          </div>
                          {pkg.importNames.length > 0 && (
                            <div className="text-xs text-slate-500 mt-1">
                              Imports: {pkg.importNames.join(', ')}
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-slate-400">
                          v{pkg.suggestion.version}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'updates' && (
            <div>
              {updates.length === 0 ? (
                <div className="text-center py-8">
                  <HiCheckCircle className="mx-auto w-12 h-12 text-green-400 mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">All packages are up to date!</h3>
                  <p className="text-slate-400">No updates available for your dependencies.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {updates.map((update, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <HiCube className="w-4 h-4 text-yellow-400" />
                          <span className="font-medium text-white">{update.name}</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            update.type === 'major' ? 'bg-red-500 text-white' :
                            update.type === 'minor' ? 'bg-yellow-500 text-white' :
                            'bg-green-500 text-white'
                          }`}>
                            {update.type}
                          </span>
                        </div>
                        <div className="text-sm text-slate-400 mt-1">
                          {update.currentVersion} → {update.latestVersion}
                        </div>
                      </div>
                      <button className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600 transition-colors">
                        Update
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'actions' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                <h3 className="text-lg font-medium text-white mb-2 flex items-center gap-2">
                  <HiArrowDownTray className="w-5 h-5 text-green-400" />
                  Export Configuration
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                  Generate and download a complete package.json file with all detected dependencies.
                </p>
                <button
                  onClick={downloadPackageJson}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                >
                  <HiArrowDownTray className="w-4 h-4" />
                  Download package.json
                </button>
              </div>
              
              <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                <h3 className="text-lg font-medium text-white mb-2 flex items-center gap-2">
                  <HiCog6Tooth className="w-5 h-5 text-blue-400" />
                  Auto-Detection Settings
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                  Configure how the package manager detects and handles dependencies.
                </p>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-slate-300">
                    <input type="checkbox" defaultChecked className="rounded" />
                    Auto-install missing packages
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-300">
                    <input type="checkbox" defaultChecked className="rounded" />
                    Check for updates on startup
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-300">
                    <input type="checkbox" className="rounded" />
                    Prefer TypeScript packages
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
