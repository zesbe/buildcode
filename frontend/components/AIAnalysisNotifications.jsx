import React, { useState, useEffect } from 'react';
import { HiBugAnt, HiLightBulb, HiShieldCheck, HiBolt, HiXMark, HiCheckCircle, HiExclamationTriangle } from 'react-icons/hi2';

export default function AIAnalysisNotifications({ 
  analysis, 
  filename, 
  onDismiss, 
  onApplyFix,
  autoFixEnabled = true 
}) {
  const [dismissedItems, setDismissedItems] = useState(new Set());
  const [expandedSections, setExpandedSections] = useState(new Set(['errors']));

  // Auto-dismiss low priority notifications
  useEffect(() => {
    if (analysis?.warnings?.length > 5) {
      setTimeout(() => {
        setDismissedItems(prev => new Set([...prev, ...analysis.warnings.slice(3).map((_, i) => `warning-${i + 3}`)]));
      }, 10000);
    }
  }, [analysis]);

  if (!analysis) return null;

  const toggleSection = (section) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const dismissItem = (type, index) => {
    const itemId = `${type}-${index}`;
    setDismissedItems(prev => new Set([...prev, itemId]));
  };

  const isItemDismissed = (type, index) => {
    return dismissedItems.has(`${type}-${index}`);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'blue';
      default: return 'slate';
    }
  };

  const NotificationItem = ({ children, type, color, onDismiss, dismissible = true }) => (
    <div className={`relative p-3 bg-${color}-500/10 border border-${color}-500/20 rounded-lg`}>
      {dismissible && (
        <button
          onClick={onDismiss}
          className={`absolute top-2 right-2 p-1 text-${color}-400/60 hover:text-${color}-400 hover:bg-${color}-500/20 rounded transition-colors`}
        >
          <HiXMark className="w-3 h-3" />
        </button>
      )}
      {children}
    </div>
  );

  const SectionHeader = ({ icon: Icon, title, count, color, isExpanded, onToggle }) => (
    <button
      onClick={onToggle}
      className={`flex items-center justify-between w-full p-2 bg-${color}-500/5 border border-${color}-500/10 rounded-lg hover:bg-${color}-500/10 transition-colors`}
    >
      <div className="flex items-center gap-2">
        <Icon className={`text-${color}-400 w-4 h-4`} />
        <span className={`text-sm font-medium text-${color}-400`}>{title}</span>
        <span className={`text-xs bg-${color}-500/20 text-${color}-300 px-2 py-1 rounded-full`}>
          {count}
        </span>
      </div>
      <div className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
        <span className={`text-${color}-400`}>›</span>
      </div>
    </button>
  );

  return (
    <div className="fixed top-20 right-4 w-96 max-h-[80vh] overflow-y-auto space-y-3 z-50">
      {/* Analysis Summary */}
      <div className="p-4 bg-slate-800/90 backdrop-blur border border-slate-700 rounded-lg shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">AI Analysis: {filename}</h3>
          <button
            onClick={onDismiss}
            className="text-slate-400 hover:text-white p-1 hover:bg-slate-700 rounded transition-colors"
          >
            <HiXMark className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quality Score */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Code Quality</span>
              <span>{analysis.quality}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  analysis.quality > 80 ? 'bg-green-400' :
                  analysis.quality > 60 ? 'bg-yellow-400' : 'bg-red-400'
                }`}
                style={{ width: `${analysis.quality}%` }}
              ></div>
            </div>
          </div>
          <div className={`text-sm font-bold ${
            analysis.quality > 80 ? 'text-green-400' :
            analysis.quality > 60 ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {analysis.quality > 80 ? '🎉' :
             analysis.quality > 60 ? '👍' : '⚠️'}
          </div>
        </div>

        {/* Auto-fix Status */}
        {autoFixEnabled && analysis.autoFixes?.length > 0 && (
          <div className="p-2 bg-green-500/10 border border-green-500/20 rounded-lg mb-4">
            <div className="flex items-center gap-2 text-green-400 text-xs">
              <HiBolt className="w-3 h-3" />
              <span>Auto-fixed {analysis.autoFixes.length} issues</span>
              <HiCheckCircle className="w-3 h-3" />
            </div>
          </div>
        )}

        {/* Errors Section */}
        {analysis.errors?.length > 0 && (
          <div className="mb-3">
            <SectionHeader
              icon={HiBugAnt}
              title="Errors"
              count={analysis.errors.length}
              color="red"
              isExpanded={expandedSections.has('errors')}
              onToggle={() => toggleSection('errors')}
            />
            
            {expandedSections.has('errors') && (
              <div className="mt-2 space-y-2">
                {analysis.errors.map((error, index) => (
                  !isItemDismissed('error', index) && (
                    <NotificationItem
                      key={`error-${index}`}
                      type="error"
                      color="red"
                      onDismiss={() => dismissItem('error', index)}
                    >
                      <div className="pr-6">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-red-400">Line {error.line}</span>
                          <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">
                            {error.type}
                          </span>
                        </div>
                        <div className="text-xs text-slate-300">{error.message}</div>
                        {error.autoFix && (
                          <button
                            onClick={() => onApplyFix?.(error)}
                            className="mt-2 text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors"
                          >
                            Apply Fix
                          </button>
                        )}
                      </div>
                    </NotificationItem>
                  )
                ))}
              </div>
            )}
          </div>
        )}

        {/* Warnings Section */}
        {analysis.warnings?.length > 0 && (
          <div className="mb-3">
            <SectionHeader
              icon={HiExclamationTriangle}
              title="Warnings"
              count={analysis.warnings.length}
              color="yellow"
              isExpanded={expandedSections.has('warnings')}
              onToggle={() => toggleSection('warnings')}
            />
            
            {expandedSections.has('warnings') && (
              <div className="mt-2 space-y-2">
                {analysis.warnings.slice(0, 3).map((warning, index) => (
                  !isItemDismissed('warning', index) && (
                    <NotificationItem
                      key={`warning-${index}`}
                      type="warning"
                      color="yellow"
                      onDismiss={() => dismissItem('warning', index)}
                    >
                      <div className="pr-6">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-yellow-400">Line {warning.line}</span>
                          <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">
                            {warning.type}
                          </span>
                        </div>
                        <div className="text-xs text-slate-300">{warning.message}</div>
                      </div>
                    </NotificationItem>
                  )
                ))}
                {analysis.warnings.length > 3 && (
                  <div className="text-xs text-slate-400 text-center py-2">
                    And {analysis.warnings.length - 3} more warnings...
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Suggestions Section */}
        {analysis.suggestions?.length > 0 && (
          <div className="mb-3">
            <SectionHeader
              icon={HiLightBulb}
              title="Suggestions"
              count={analysis.suggestions.length}
              color="blue"
              isExpanded={expandedSections.has('suggestions')}
              onToggle={() => toggleSection('suggestions')}
            />
            
            {expandedSections.has('suggestions') && (
              <div className="mt-2 space-y-2">
                {analysis.suggestions.slice(0, 2).map((suggestion, index) => (
                  !isItemDismissed('suggestion', index) && (
                    <NotificationItem
                      key={`suggestion-${index}`}
                      type="suggestion"
                      color="blue"
                      onDismiss={() => dismissItem('suggestion', index)}
                    >
                      <div className="pr-6">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                            {suggestion.type}
                          </span>
                        </div>
                        <div className="text-xs text-slate-300">{suggestion.message}</div>
                      </div>
                    </NotificationItem>
                  )
                ))}
              </div>
            )}
          </div>
        )}

        {/* Security Issues */}
        {analysis.security?.length > 0 && (
          <div className="mb-3">
            <SectionHeader
              icon={HiShieldCheck}
              title="Security"
              count={analysis.security.length}
              color="purple"
              isExpanded={expandedSections.has('security')}
              onToggle={() => toggleSection('security')}
            />
            
            {expandedSections.has('security') && (
              <div className="mt-2 space-y-2">
                {analysis.security.map((security, index) => (
                  !isItemDismissed('security', index) && (
                    <NotificationItem
                      key={`security-${index}`}
                      type="security"
                      color={getSeverityColor(security.severity)}
                      onDismiss={() => dismissItem('security', index)}
                      dismissible={security.severity !== 'critical'}
                    >
                      <div className="pr-6">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs bg-${getSeverityColor(security.severity)}-500/20 text-${getSeverityColor(security.severity)}-300 px-2 py-1 rounded`}>
                            {security.severity} severity
                          </span>
                        </div>
                        <div className="text-xs text-slate-300">{security.message}</div>
                      </div>
                    </NotificationItem>
                  )
                ))}
              </div>
            )}
          </div>
        )}

        {/* Performance Issues */}
        {analysis.performance?.length > 0 && (
          <div className="mb-3">
            <SectionHeader
              icon={HiBolt}
              title="Performance"
              count={analysis.performance.length}
              color="green"
              isExpanded={expandedSections.has('performance')}
              onToggle={() => toggleSection('performance')}
            />
            
            {expandedSections.has('performance') && (
              <div className="mt-2 space-y-2">
                {analysis.performance.map((perf, index) => (
                  !isItemDismissed('performance', index) && (
                    <NotificationItem
                      key={`performance-${index}`}
                      type="performance"
                      color="green"
                      onDismiss={() => dismissItem('performance', index)}
                    >
                      <div className="pr-6">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
                            {perf.impact} impact
                          </span>
                        </div>
                        <div className="text-xs text-slate-300">{perf.message}</div>
                      </div>
                    </NotificationItem>
                  )
                ))}
              </div>
            )}
          </div>
        )}

        {/* Analysis Timestamp */}
        <div className="text-xs text-slate-500 text-center mt-4 pt-3 border-t border-slate-700">
          Analysis completed at {new Date(analysis.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}

// Helper component for floating quick fixes
export function QuickFixNotification({ fix, onApply, onDismiss }) {
  return (
    <div className="fixed bottom-4 right-4 p-4 bg-blue-500 text-white rounded-lg shadow-xl max-w-sm">
      <div className="flex items-start gap-3">
        <HiBolt className="flex-shrink-0 mt-1 w-4 h-4" />
        <div className="flex-1">
          <div className="font-medium text-sm">Quick Fix Available</div>
          <div className="text-xs opacity-90 mt-1">{fix.message}</div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={onApply}
              className="text-xs bg-white text-blue-500 px-3 py-1 rounded hover:bg-blue-50 transition-colors"
            >
              Apply Fix
            </button>
            <button
              onClick={onDismiss}
              className="text-xs bg-blue-600 px-3 py-1 rounded hover:bg-blue-700 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
