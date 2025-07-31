import React, { useState, useEffect } from 'react';
import { HiCube, HiXMark, HiPlus, HiTrash, HiDownload, HiSparkles } from 'react-icons/hi2';
import { detectDependencies, generatePackageJson, getSuggestedDependencies, commonDependencies } from '../utils/dependencyDetector';

export default function SmartPackageManager({ files, isOpen, onClose, showNotification, onAddFile }) {
  const [detectedDeps, setDetectedDeps] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [customDeps, setCustomDeps] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('detected');

  useEffect(() => {
    if (isOpen && files) {
      const detected = detectDependencies(files);
      setDetectedDeps(detected);
      setSuggestions(getSuggestedDependencies(detected));
    }
  }, [files, isOpen]);

  const handleAddCustomDep = () => {
    if (!searchTerm.trim()) return;
    
    const depName = searchTerm.trim().toLowerCase();
    if (commonDependencies[depName]) {
      setCustomDeps(prev => [...prev, depName]);
      setSearchTerm('');
      showNotification(`Added ${depName} to custom dependencies`, 'success');
    } else {
      showNotification(`Dependency "${depName}" not found in common packages`, 'error');
    }
  };

  const handleRemoveCustomDep = (depName) => {
    setCustomDeps(prev => prev.filter(dep => dep !== depName));
    showNotification(`Removed ${depName} from custom dependencies`, 'success');
  };

  const generateAndDownloadPackageJson = () => {
    const allDeps = [...detectedDeps, ...customDeps];
    const packageJson = generatePackageJson('my-project', allDeps);
    
    const content = JSON.stringify(packageJson, null, 2);
    onAddFile('package.json', content);
    showNotification('package.json generated and added to project!', 'success');
  };

  const filteredCommonDeps = Object.keys(commonDependencies).filter(dep =>
    dep.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <HiCube className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Smart Package Manager</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <HiXMark className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700">
          <button
            onClick={() => setActiveTab('detected')}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'detected'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Auto-Detected ({detectedDeps.length})
          </button>
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'suggestions'
                ? 'text-green-400 border-b-2 border-green-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Suggestions ({suggestions.length})
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'custom'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Custom ({customDeps.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'detected' && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-2">Automatically Detected Dependencies</h3>
                <p className="text-slate-400 text-sm">Based on your code analysis</p>
              </div>
              
              {detectedDeps.length === 0 ? (
                <div className="text-center py-8">
                  <HiSparkles className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                  <p className="text-slate-400">No dependencies detected yet.</p>
                  <p className="text-slate-500 text-sm">Write some code and I'll analyze it!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {detectedDeps.map(dep => {
                    const info = commonDependencies[dep];
                    return (
                      <div key={dep} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-white">{dep}</h4>
                          <span className={`px-2 py-1 rounded text-xs ${
                            info?.dev ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {info?.dev ? 'dev' : 'prod'}
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm mb-2">{info?.description}</p>
                        <div className="text-slate-500 text-xs font-mono">{info?.version}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'suggestions' && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-2">Recommended Dependencies</h3>
                <p className="text-slate-400 text-sm">Packages that work well with your current setup</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {suggestions.map(suggestion => (
                  <div key={suggestion.name} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-white">{suggestion.name}</h4>
                      <button
                        onClick={() => {
                          setCustomDeps(prev => [...prev, suggestion.name]);
                          showNotification(`Added ${suggestion.name} to custom dependencies`, 'success');
                        }}
                        className="p-1.5 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                      >
                        <HiPlus className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-slate-400 text-sm mb-2">{suggestion.description}</p>
                    <p className="text-green-400 text-xs mb-2">{suggestion.reason}</p>
                    <div className="text-slate-500 text-xs font-mono">{suggestion.version}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'custom' && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-2">Custom Dependencies</h3>
                <p className="text-slate-400 text-sm">Add any package you need</p>
              </div>

              {/* Search and Add */}
              <div className="mb-6 bg-slate-800/50 rounded-lg p-4">
                <div className="flex gap-3 mb-3">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search packages (e.g., axios, lodash, uuid...)"
                    className="flex-1 bg-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCustomDep()}
                  />
                  <button
                    onClick={handleAddCustomDep}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
                  >
                    Add
                  </button>
                </div>
                
                {searchTerm && (
                  <div className="max-h-32 overflow-y-auto">
                    <div className="text-xs text-slate-400 mb-2">Matching packages:</div>
                    <div className="flex flex-wrap gap-2">
                      {filteredCommonDeps.slice(0, 10).map(dep => (
                        <button
                          key={dep}
                          onClick={() => setSearchTerm(dep)}
                          className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-xs transition-colors"
                        >
                          {dep}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Custom Dependencies List */}
              {customDeps.length === 0 ? (
                <div className="text-center py-8">
                  <HiCube className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                  <p className="text-slate-400">No custom dependencies added yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {customDeps.map(dep => {
                    const info = commonDependencies[dep];
                    return (
                      <div key={dep} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-white">{dep}</h4>
                          <button
                            onClick={() => handleRemoveCustomDep(dep)}
                            className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                          >
                            <HiTrash className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-slate-400 text-sm mb-2">{info?.description}</p>
                        <div className="text-slate-500 text-xs font-mono">{info?.version}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 bg-slate-800/50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-400">
              Total: {detectedDeps.length + customDeps.length} dependencies
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => onClose()}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={generateAndDownloadPackageJson}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <HiDownload className="w-4 h-4" />
                Generate package.json
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}