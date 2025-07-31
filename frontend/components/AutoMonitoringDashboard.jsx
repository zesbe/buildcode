import React, { useState, useEffect } from 'react';
import { 
  HiChartBarSquare, 
  HiXMark, 
  HiExclamationTriangle,
  HiCheckCircle,
  HiClock,
  HiArrowPath,
  HiBolt,
  HiSignal,
  HiCommandLine,
  HiServer
} from 'react-icons/hi2';
import { autoErrorRecovery, deploymentMonitor } from '../utils/autoErrorRecovery';
import { advancedAutoSave } from '../utils/advancedAutoSave';

export default function AutoMonitoringDashboard({ isOpen, onClose, showNotification }) {
  const [errorStats, setErrorStats] = useState({});
  const [deploymentStatus, setDeploymentStatus] = useState({});
  const [saveStats, setSaveStats] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (isOpen) {
      updateStats();
      
      if (autoRefresh) {
        const interval = setInterval(updateStats, 5000); // Update every 5 seconds
        return () => clearInterval(interval);
      }
    }
  }, [isOpen, autoRefresh]);

  const updateStats = () => {
    setErrorStats(autoErrorRecovery.getErrorStats());
    setDeploymentStatus(deploymentMonitor.getMonitoringReport());
    setSaveStats(advancedAutoSave.getStats());
  };

  const handleForceRecovery = async () => {
    try {
      await autoErrorRecovery.attemptRecovery(
        { message: 'Manual recovery', type: 'manual' },
        'general'
      );
      showNotification('Recovery attempt initiated', 'info');
      updateStats();
    } catch (error) {
      showNotification('Recovery failed: ' + error.message, 'error');
    }
  };

  const handleClearErrors = () => {
    autoErrorRecovery.clearErrors();
    deploymentMonitor.clearAlerts();
    updateStats();
    showNotification('Error logs cleared', 'success');
  };

  const getHealthColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-400';
      case 'degraded': return 'text-yellow-400';
      case 'failed': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getHealthBg = (status) => {
    switch (status) {
      case 'healthy': return 'bg-green-500/10 border-green-500/20';
      case 'degraded': return 'bg-yellow-500/10 border-yellow-500/20';
      case 'failed': return 'bg-red-500/10 border-red-500/20';
      default: return 'bg-slate-500/10 border-slate-500/20';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <HiChartBarSquare className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Auto Monitoring Dashboard</h2>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${deploymentStatus.status === 'healthy' ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`}></div>
              <span className="text-sm text-slate-400">
                {deploymentStatus.status === 'healthy' ? 'All Systems Operational' : 'Issues Detected'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-2 rounded-lg transition-colors ${
                autoRefresh ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'
              }`}
              title="Auto Refresh"
            >
              <HiArrowPath className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={updateStats}
              className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              title="Refresh Now"
            >
              <HiArrowPath className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <HiXMark className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700">
          {[
            { id: 'overview', label: 'Overview', icon: HiChartBarSquare },
            { id: 'errors', label: 'Error Recovery', icon: HiExclamationTriangle },
            { id: 'deployment', label: 'Deployment', icon: HiServer },
            { id: 'performance', label: 'Performance', icon: HiCommandLine }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* System Health Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={`p-4 rounded-lg border ${getHealthBg(deploymentStatus.status)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-white">System Health</h3>
                    <HiSignal className={`w-5 h-5 ${getHealthColor(deploymentStatus.status)}`} />
                  </div>
                  <div className={`text-2xl font-bold ${getHealthColor(deploymentStatus.status)} mb-1`}>
                    {deploymentStatus.uptime ? `${deploymentStatus.uptime.toFixed(1)}%` : 'N/A'}
                  </div>
                  <div className="text-xs text-slate-400">Uptime</div>
                </div>

                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-white">Error Recovery</h3>
                    <HiBolt className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {autoErrorRecovery.getHealthScore()}
                  </div>
                  <div className="text-xs text-slate-400">Health Score</div>
                </div>

                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-white">Auto Save</h3>
                    <HiClock className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {saveStats.pendingSaves || 0}
                  </div>
                  <div className="text-xs text-slate-400">Pending Saves</div>
                </div>

                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-white">Recent Errors</h3>
                    <HiExclamationTriangle className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {errorStats.recent || 0}
                  </div>
                  <div className="text-xs text-slate-400">Last Hour</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleForceRecovery}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                  >
                    Force Recovery
                  </button>
                  <button
                    onClick={handleClearErrors}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
                  >
                    Clear Error Logs
                  </button>
                  <button
                    onClick={() => advancedAutoSave.forceSaveAll()}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
                  >
                    Force Save All
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {deploymentStatus.activeAlerts?.map((alert, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-slate-700/50 rounded-lg">
                      <HiExclamationTriangle className={`w-4 h-4 mt-0.5 ${
                        alert.severity === 'high' ? 'text-red-400' : 
                        alert.severity === 'medium' ? 'text-yellow-400' : 'text-blue-400'
                      }`} />
                      <div className="flex-1">
                        <div className="text-sm text-white">{alert.message}</div>
                        <div className="text-xs text-slate-400">
                          {alert.timestamp ? new Date(alert.timestamp).toLocaleTimeString() : '--:--'}
                        </div>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-4 text-slate-400">
                      <HiCheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
                      <p>No recent alerts - all systems normal</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'errors' && (
            <div className="space-y-6">
              {/* Error Categories */}
              <div className="bg-slate-800/50 rounded-lg p4 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">Error Categories</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Object.entries(errorStats.categories || {}).map(([category, count]) => (
                    <div key={category} className="p-3 bg-slate-700/50 rounded-lg">
                      <div className="text-xl font-bold text-white">{count}</div>
                      <div className="text-sm text-slate-400 capitalize">{category}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recovery Strategies */}
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">Active Recovery Strategies</h3>
                <div className="space-y-2">
                  {['network', 'storage', 'memory', 'hydration', 'api'].map(strategy => (
                    <div key={strategy} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                      <span className="text-white capitalize">{strategy} Recovery</span>
                      <span className="text-green-400 text-sm">Active</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'deployment' && (
            <div className="space-y-6">
              {/* Service Health */}
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">Service Health Checks</h3>
                <div className="space-y-3">
                  {deploymentStatus.recentChecks?.slice(-1)[0]?.results?.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          result.status === 'healthy' ? 'bg-green-400' : 
                          result.status === 'degraded' ? 'bg-yellow-400' : 'bg-red-400'
                        }`}></div>
                        <span className="text-white">{result.name}</span>
                      </div>
                      <span className={`text-sm capitalize ${getHealthColor(result.status)}`}>
                        {result.status}
                      </span>
                    </div>
                  )) || (
                    <div className="text-center py-4 text-slate-400">
                      No health check data available
                    </div>
                  )}
                </div>
              </div>

              {/* Deployment Timeline */}
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Checks</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {deploymentStatus.recentChecks?.map((check, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-slate-700/30 rounded">
                      <span className="text-sm text-slate-300">
                        {new Date(check.timestamp).toLocaleString()}
                      </span>
                      <span className={`text-sm capitalize ${getHealthColor(check.overallHealth)}`}>
                        {check.overallHealth}
                      </span>
                    </div>
                  )) || (
                    <div className="text-center py-4 text-slate-400">
                      No deployment data available
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-6">
              {/* Save Performance */}
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">Auto-Save Performance</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-slate-700/50 rounded-lg">
                    <div className="text-xl font-bold text-white">{saveStats.pendingSaves || 0}</div>
                    <div className="text-sm text-slate-400">Pending</div>
                  </div>
                  <div className="p-3 bg-slate-700/50 rounded-lg">
                    <div className="text-xl font-bold text-white">{saveStats.conflicts || 0}</div>
                    <div className="text-sm text-slate-400">Conflicts</div>
                  </div>
                  <div className="p-3 bg-slate-700/50 rounded-lg">
                    <div className="text-xl font-bold text-white">{saveStats.totalVersions || 0}</div>
                    <div className="text-sm text-slate-400">Versions</div>
                  </div>
                  <div className="p-3 bg-slate-700/50 rounded-lg">
                    <div className="text-xl font-bold text-white">{saveStats.historySize || 0}</div>
                    <div className="text-sm text-slate-400">History</div>
                  </div>
                </div>
              </div>

              {/* System Resources */}
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">System Resources</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300">Memory Usage</span>
                      <span className="text-slate-400">~{Math.round(performance.memory?.usedJSHeapSize / 1024 / 1024) || 0}MB</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{
                        width: `${Math.min((performance.memory?.usedJSHeapSize / performance.memory?.totalJSHeapSize) * 100 || 0, 100)}%`
                      }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300">Error Rate</span>
                      <span className="text-slate-400">{errorStats.recent || 0}/hour</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{
                        width: `${Math.min((errorStats.recent || 0) * 2, 100)}%`
                      }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 bg-slate-800/50">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div>
              Last updated: {new Date().toLocaleTimeString()}
            </div>
            <div className="flex items-center gap-4">
              <span>Health Score: {autoErrorRecovery.getHealthScore()}/100</span>
              <span>Auto-refresh: {autoRefresh ? 'On' : 'Off'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}