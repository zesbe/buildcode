// Auto error recovery and monitoring system
export class AutoErrorRecovery {
  constructor() {
    this.errors = [];
    this.recoveryStrategies = new Map();
    this.monitoringEnabled = true;
    this.maxErrors = 50;
    this.recoveryAttempts = new Map();
    
    this.setupGlobalErrorHandlers();
    this.setupRecoveryStrategies();
    
    // Cleanup old errors every 5 minutes
    setInterval(() => this.cleanupOldErrors(), 5 * 60 * 1000);
  }

  setupGlobalErrorHandlers() {
    // Only setup in browser environment
    if (typeof window === 'undefined') return;
    
    // Handle unhandled errors
    window.addEventListener('error', (event) => {
      this.handleError({
        type: 'javascript',
        message: event.message,
        filename: event.filename,
        line: event.lineno,
        column: event.colno,
        stack: event.error?.stack,
        timestamp: Date.now()
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError({
        type: 'promise',
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack,
        timestamp: Date.now()
      });
    });

    // Handle React errors (if error boundary forwards them)
    window.addEventListener('react-error', (event) => {
      this.handleError({
        type: 'react',
        message: event.detail.message,
        stack: event.detail.stack,
        component: event.detail.component,
        timestamp: Date.now()
      });
    });
  }

  setupRecoveryStrategies() {
    // Network error recovery
    this.recoveryStrategies.set('network', async (error) => {
      if (navigator.onLine) {
        // Retry after delay
        await this.delay(2000);
        return { retry: true, message: 'Network restored, retrying...' };
      }
      return { retry: false, message: 'Network still offline' };
    });

    // Storage error recovery
    this.recoveryStrategies.set('storage', async (error) => {
      try {
        // Clear some storage space
        this.cleanupLocalStorage();
        return { retry: true, message: 'Cleared storage space' };
      } catch (e) {
        return { retry: false, message: 'Storage cleanup failed' };
      }
    });

    // Memory error recovery
    this.recoveryStrategies.set('memory', async (error) => {
      // Force garbage collection if available
      if (window.gc) {
        window.gc();
      }
      
      // Clear caches
      this.clearCaches();
      
      return { retry: true, message: 'Memory cleaned up' };
    });

    // React hydration error recovery
    this.recoveryStrategies.set('hydration', async (error) => {
      // Force page reload for hydration errors
      if (error.message.includes('hydrat') || error.message.includes('#418') || error.message.includes('#425')) {
        await this.delay(1000);
        window.location.reload();
        return { retry: true, message: 'Reloading page to fix hydration' };
      }
      return { retry: false, message: 'Not a hydration error' };
    });

    // API error recovery
    this.recoveryStrategies.set('api', async (error) => {
      // Check API health
      try {
        const response = await fetch('/api/health', { method: 'HEAD' });
        if (response.ok) {
          return { retry: true, message: 'API is healthy, retrying' };
        }
      } catch (e) {
        // API is down, use fallback
        return { retry: false, message: 'API is down, using fallback mode' };
      }
      return { retry: false, message: 'API error recovery failed' };
    });
  }

  async handleError(error) {
    if (!this.monitoringEnabled) return;

    // Add to error log
    this.errors.push(error);
    
    // Keep only recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Determine error category
    const category = this.categorizeError(error);
    
    // Attempt recovery
    if (this.shouldAttemptRecovery(error, category)) {
      await this.attemptRecovery(error, category);
    }

    // Log error for debugging
    console.group(`🔧 Auto Error Recovery: ${category}`);
    console.error('Error:', error);
    console.log('Recovery strategy:', this.recoveryStrategies.has(category) ? 'Available' : 'None');
    console.groupEnd();

    // Notify error monitoring service (if available)
    this.notifyMonitoring(error, category);
  }

  categorizeError(error) {
    const message = error.message?.toLowerCase() || '';
    const stack = error.stack?.toLowerCase() || '';

    if (message.includes('network') || message.includes('fetch')) return 'network';
    if (message.includes('storage') || message.includes('quota')) return 'storage';
    if (message.includes('memory') || message.includes('heap')) return 'memory';
    if (message.includes('hydrat') || message.includes('#418') || message.includes('#425') || message.includes('#423')) return 'hydration';
    if (message.includes('api') || stack.includes('/api/')) return 'api';
    if (error.type === 'react') return 'react';
    if (error.type === 'promise') return 'promise';
    
    return 'general';
  }

  shouldAttemptRecovery(error, category) {
    const key = `${category}-${error.message}`;
    const attempts = this.recoveryAttempts.get(key) || 0;
    
    // Don't retry more than 3 times for the same error
    if (attempts >= 3) return false;
    
    // Don't attempt recovery for certain error types
    const noRecoveryCategories = ['syntax', 'security'];
    if (noRecoveryCategories.includes(category)) return false;
    
    return true;
  }

  async attemptRecovery(error, category) {
    const strategy = this.recoveryStrategies.get(category);
    if (!strategy) return;

    const key = `${category}-${error.message}`;
    const attempts = this.recoveryAttempts.get(key) || 0;
    this.recoveryAttempts.set(key, attempts + 1);

    try {
      const result = await strategy(error);
      
      if (result.retry) {
        console.log(`✅ Recovery successful for ${category}: ${result.message}`);
        
        // Dispatch recovery event
        window.dispatchEvent(new CustomEvent('error-recovered', {
          detail: { error, category, strategy: result.message }
        }));
      } else {
        console.log(`❌ Recovery failed for ${category}: ${result.message}`);
      }
    } catch (recoveryError) {
      console.error(`💥 Recovery strategy failed:`, recoveryError);
    }
  }

  cleanupLocalStorage() {
    try {
      // Remove old cache entries
      const keys = Object.keys(localStorage);
      const oldKeys = keys.filter(key => {
        try {
          const item = localStorage.getItem(key);
          const data = JSON.parse(item);
          if (data.timestamp && Date.now() - data.timestamp > 7 * 24 * 60 * 60 * 1000) { // 7 days
            return true;
          }
        } catch (e) {
          // Invalid JSON, might be old data
          return true;
        }
        return false;
      });

      oldKeys.forEach(key => localStorage.removeItem(key));
      console.log(`🧹 Cleaned up ${oldKeys.length} old localStorage entries`);
    } catch (error) {
      console.error('Failed to cleanup localStorage:', error);
    }
  }

  clearCaches() {
    try {
      // Clear various caches
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            if (name.includes('old') || name.includes('temp')) {
              caches.delete(name);
            }
          });
        });
      }
    } catch (error) {
      console.error('Failed to clear caches:', error);
    }
  }

  cleanupOldErrors() {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    this.errors = this.errors.filter(error => error.timestamp > fiveMinutesAgo);
    
    // Clear old recovery attempts
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
    for (const [key, timestamp] of this.recoveryAttempts.entries()) {
      if (timestamp < tenMinutesAgo) {
        this.recoveryAttempts.delete(key);
      }
    }
  }

  notifyMonitoring(error, category) {
    // In a real app, this would send to error monitoring service
    if (window.errorMonitoring) {
      window.errorMonitoring.report({
        error,
        category,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    }
  }

  getErrorStats() {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    const recentErrors = this.errors.filter(e => e.timestamp > oneHourAgo);
    
    const categories = {};
    recentErrors.forEach(error => {
      const category = this.categorizeError(error);
      categories[category] = (categories[category] || 0) + 1;
    });

    return {
      total: this.errors.length,
      recent: recentErrors.length,
      categories,
      recoveryAttempts: this.recoveryAttempts.size
    };
  }

  getHealthScore() {
    const stats = this.getErrorStats();
    const maxScore = 100;
    
    // Reduce score based on recent errors
    let score = maxScore;
    score -= Math.min(stats.recent * 5, 50); // Max 50 point reduction for errors
    
    // Bonus for successful recoveries
    const successfulRecoveries = Array.from(this.recoveryAttempts.values()).filter(a => a > 0).length;
    score += Math.min(successfulRecoveries * 2, 20); // Max 20 point bonus
    
    return Math.max(0, Math.min(100, score));
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Enable/disable monitoring
  setMonitoring(enabled) {
    this.monitoringEnabled = enabled;
  }

  // Get error report
  getErrorReport() {
    return {
      errors: this.errors.slice(-10), // Last 10 errors
      stats: this.getErrorStats(),
      healthScore: this.getHealthScore(),
      recoveryStrategies: Array.from(this.recoveryStrategies.keys())
    };
  }

  // Clear all errors
  clearErrors() {
    this.errors = [];
    this.recoveryAttempts.clear();
  }
}

// Deployment monitoring system
export class DeploymentMonitor {
  constructor() {
    this.deploymentStatus = 'unknown';
    this.lastCheck = null;
    this.healthChecks = [];
    this.alerts = [];
    
    this.startMonitoring();
  }

  startMonitoring() {
    // Only start in browser environment
    if (typeof window === 'undefined') return;
    
    // Skip monitoring in development environment to prevent console noise
    if (typeof window !== 'undefined' && 
        (window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1' ||
         window.location.port === '3000')) {
      console.log('DeploymentMonitor: Skipping health checks in development mode');
      return;
    }
    
    // Check deployment health every 2 minutes
    setInterval(() => {
      this.checkDeploymentHealth();
    }, 2 * 60 * 1000);
    
    // Initial check with delay to let app fully load
    setTimeout(() => this.checkDeploymentHealth(), 5000);
  }

  async checkDeploymentHealth() {
    try {
      const checks = await Promise.allSettled([
        this.checkAPIHealth(),
        this.checkAssetHealth(),
        this.checkDatabaseHealth(),
        this.checkExternalServices()
      ]);

      const results = checks.map((check, index) => ({
        name: ['API', 'Assets', 'Database', 'External'][index],
        status: check.status === 'fulfilled' ? check.value : 'failed',
        error: check.status === 'rejected' ? check.reason : null
      }));

      this.healthChecks.push({
        timestamp: Date.now(),
        results,
        overallHealth: results.every(r => r.status === 'healthy') ? 'healthy' : 'degraded'
      });

      // Keep only last 24 hours of checks
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      this.healthChecks = this.healthChecks.filter(check => check.timestamp > oneDayAgo);

      this.lastCheck = Date.now();
      
      // Check for alerts
      this.checkForAlerts(results);
    } catch (error) {
      console.warn('DeploymentMonitor: Health check failed:', error);
    }
  }

  async checkAPIHealth() {
    try {
      const response = await fetch('/api/health', { 
        method: 'HEAD',
        timeout: 5000 
      });
      return response.ok ? 'healthy' : 'unhealthy';
    } catch (error) {
      return 'failed';
    }
  }

  async checkAssetHealth() {
    try {
      // Check if critical assets are loading - use SVG favicon instead of ICO
      const testImage = new Image();
      testImage.src = '/favicon.svg?' + Date.now();
      
      return new Promise((resolve) => {
        testImage.onload = () => resolve('healthy');
        testImage.onerror = () => {
          // Fallback: just check if we can fetch any asset
          fetch('/favicon.svg', { method: 'HEAD' })
            .then(response => resolve(response.ok ? 'healthy' : 'unhealthy'))
            .catch(() => resolve('unhealthy'));
        };
        setTimeout(() => resolve('timeout'), 3000);
      });
    } catch (error) {
      return 'failed';
    }
  }

  async checkDatabaseHealth() {
    try {
      // This would check database connectivity in a real app
      const response = await fetch('/api/db-health');
      return response.ok ? 'healthy' : 'unhealthy';
    } catch (error) {
      return 'unknown'; // Database check not implemented
    }
  }

  async checkExternalServices() {
    try {
      // For frontend-only app, we can't directly check external APIs due to CORS
      // Instead, we'll check if our own API endpoints are responding
      const services = [
        '/api/health',
        '/api/db-health'
      ];
      
      const checks = await Promise.allSettled(
        services.map(url => fetch(url, { method: 'HEAD', timeout: 3000 }))
      );
      
      const healthyCount = checks.filter(check => 
        check.status === 'fulfilled' && check.value.ok
      ).length;
      
      return healthyCount >= services.length / 2 ? 'healthy' : 'degraded';
    } catch (error) {
      return 'unknown';
    }
  }

  checkForAlerts(results) {
    const failedServices = results.filter(r => r.status === 'failed');
    
    if (failedServices.length > 0) {
      this.addAlert({
        type: 'service_failure',
        message: `Services failing: ${failedServices.map(s => s.name).join(', ')}`,
        severity: 'high',
        timestamp: Date.now()
      });
    }

    // Check for degraded performance
    const recentChecks = this.healthChecks.slice(-5);
    const degradedCount = recentChecks.filter(check => check.overallHealth === 'degraded').length;
    
    if (degradedCount >= 3) {
      this.addAlert({
        type: 'performance_degradation',
        message: 'System performance degraded over last 5 checks',
        severity: 'medium',
        timestamp: Date.now()
      });
    }
  }

  addAlert(alert) {
    this.alerts.push(alert);
    
    // Keep only last 50 alerts
    if (this.alerts.length > 50) {
      this.alerts.shift();
    }

    // Dispatch alert event
    window.dispatchEvent(new CustomEvent('deployment-alert', {
      detail: alert
    }));

    console.warn(`🚨 Deployment Alert [${alert.severity}]: ${alert.message}`);
  }

  getDeploymentStatus() {
    if (this.healthChecks.length === 0) return 'unknown';
    
    const lastCheck = this.healthChecks[this.healthChecks.length - 1];
    return lastCheck.overallHealth;
  }

  getUptime() {
    if (this.healthChecks.length < 2) return null;
    
    const healthyChecks = this.healthChecks.filter(check => check.overallHealth === 'healthy').length;
    return (healthyChecks / this.healthChecks.length) * 100;
  }

  getAlerts(severity = null) {
    if (severity) {
      return this.alerts.filter(alert => alert.severity === severity);
    }
    return this.alerts;
  }

  clearAlerts() {
    this.alerts = [];
  }

  getMonitoringReport() {
    return {
      status: this.getDeploymentStatus(),
      uptime: this.getUptime(),
      lastCheck: this.lastCheck,
      recentChecks: this.healthChecks.slice(-10),
      activeAlerts: this.alerts.filter(alert => 
        Date.now() - alert.timestamp < 60 * 60 * 1000 // Last hour
      )
    };
  }
}

// Export instances
export const autoErrorRecovery = new AutoErrorRecovery();
export const deploymentMonitor = new DeploymentMonitor();