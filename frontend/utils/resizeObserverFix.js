// ResizeObserver Error Fix
// This utility helps prevent ResizeObserver loop errors by handling them gracefully

class ResizeObserverErrorHandler {
  constructor() {
    this.isInstalled = false;
    this.originalError = null;
    this.debouncedCallbacks = new Map();

    // Only initialize if in browser environment
    if (typeof window !== 'undefined') {
      this.originalError = window.console.error;
      this.installErrorHandler();
    }
  }

  installErrorHandler() {
    if (this.isInstalled || typeof window === 'undefined') return;

    // Suppress ResizeObserver loop errors
    window.addEventListener('error', (event) => {
      if (event.message && event.message.includes('ResizeObserver loop')) {
        event.stopImmediatePropagation();
        return false;
      }
    });

    // Override console.error to filter ResizeObserver warnings
    window.console.error = (...args) => {
      const message = args[0];
      if (typeof message === 'string' && message.includes('ResizeObserver loop')) {
        // Silently ignore ResizeObserver loop errors
        return;
      }
      if (this.originalError) {
        this.originalError.apply(console, args);
      }
    };

    this.isInstalled = true;
  }

  // Create a debounced ResizeObserver callback
  createDebouncedCallback(callback, delay = 16) {
    if (typeof window === 'undefined') {
      return () => {};
    }

    return (entries, observer) => {
      const key = callback.toString();

      if (this.debouncedCallbacks.has(key)) {
        clearTimeout(this.debouncedCallbacks.get(key));
      }

      const timeoutId = setTimeout(() => {
        if (typeof requestAnimationFrame !== 'undefined') {
          requestAnimationFrame(() => {
            try {
              callback(entries, observer);
            } catch (error) {
              console.warn('ResizeObserver callback error:', error);
            }
          });
        } else {
          setTimeout(() => {
            try {
              callback(entries, observer);
            } catch (error) {
              console.warn('ResizeObserver callback error:', error);
            }
          }, 0);
        }
        this.debouncedCallbacks.delete(key);
      }, delay);

      this.debouncedCallbacks.set(key, timeoutId);
    };
  }

  // Safe ResizeObserver wrapper
  createSafeResizeObserver(callback, options = {}) {
    if (typeof window === 'undefined' || typeof ResizeObserver === 'undefined') {
      return {
        observe: () => {},
        unobserve: () => {},
        disconnect: () => {}
      };
    }

    const { debounce = true, delay = 16 } = options;

    const safeCallback = debounce
      ? this.createDebouncedCallback(callback, delay)
      : (entries, observer) => {
          if (typeof requestAnimationFrame !== 'undefined') {
            requestAnimationFrame(() => {
              try {
                callback(entries, observer);
              } catch (error) {
                console.warn('ResizeObserver callback error:', error);
              }
            });
          } else {
            setTimeout(() => {
              try {
                callback(entries, observer);
              } catch (error) {
                console.warn('ResizeObserver callback error:', error);
              }
            }, 0);
          }
        };

    try {
      return new ResizeObserver(safeCallback);
    } catch (error) {
      console.warn('Failed to create ResizeObserver:', error);
      return {
        observe: () => {},
        unobserve: () => {},
        disconnect: () => {}
      };
    }
  }

  // Cleanup
  cleanup() {
    if (this.isInstalled && typeof window !== 'undefined') {
      if (this.originalError) {
        window.console.error = this.originalError;
      }
      this.debouncedCallbacks.forEach(timeoutId => clearTimeout(timeoutId));
      this.debouncedCallbacks.clear();
      this.isInstalled = false;
    }
  }
}

// Create global instance
const resizeObserverHandler = new ResizeObserverErrorHandler();

// Export utilities
export const createSafeResizeObserver = (callback, options) => 
  resizeObserverHandler.createSafeResizeObserver(callback, options);

export const createDebouncedCallback = (callback, delay) => 
  resizeObserverHandler.createDebouncedCallback(callback, delay);

export const cleanupResizeObserver = () => 
  resizeObserverHandler.cleanup();

// Auto-install error handler
export default resizeObserverHandler;
