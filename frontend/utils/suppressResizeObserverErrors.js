// Comprehensive ResizeObserver error suppression for browser environment only
let isInstalled = false;

export function suppressResizeObserverErrors() {
  if (typeof window === 'undefined' || isInstalled) return;

  // Suppress the ResizeObserver loop errors in console
  const originalError = window.console.error;
  const originalWarn = window.console.warn;

  window.console.error = (...args) => {
    const message = args[0];

    // Filter out ResizeObserver loop errors
    if (typeof message === 'string' &&
        (message.includes('ResizeObserver loop completed with undelivered notifications') ||
         message.includes('ResizeObserver loop limit exceeded'))) {
      return; // Silently ignore
    }

    // Filter out Monaco Editor lifecycle errors
    if (typeof message === 'string' &&
        (message.includes('Encountered errors while disposing of store') ||
         message.includes('h.dispose is not a function') ||
         message.includes('Failed to dispose editor'))) {
      return; // Silently ignore Monaco lifecycle errors
    }

    // Filter out Chrome extension errors
    if (typeof message === 'string' &&
        message.includes('A listener indicated an asynchronous response')) {
      return; // Silently ignore Chrome extension errors
    }

    // Call original console.error for other messages
    originalError.apply(console, args);
  };

  window.console.warn = (...args) => {
    const message = args[0];

    // Filter out ResizeObserver warnings
    if (typeof message === 'string' &&
        (message.includes('ResizeObserver loop completed with undelivered notifications') ||
         message.includes('ResizeObserver loop limit exceeded'))) {
      return; // Silently ignore
    }

    // Call original console.warn for other messages
    originalWarn.apply(console, args);
  };

  // Handle it as a global error event
  const handleError = (event) => {
    if (event.message &&
        (event.message.includes('ResizeObserver loop completed with undelivered notifications') ||
         event.message.includes('ResizeObserver loop limit exceeded'))) {
      event.stopImmediatePropagation();
      event.preventDefault();
      return false;
    }
  };

  // Handle unhandled promise rejections
  const handleRejection = (event) => {
    if (event.reason && event.reason.message &&
        (event.reason.message.includes('ResizeObserver loop completed with undelivered notifications') ||
         event.reason.message.includes('ResizeObserver loop limit exceeded'))) {
      event.preventDefault();
      return false;
    }
  };

  window.addEventListener('error', handleError, true);
  window.addEventListener('unhandledrejection', handleRejection, true);

  isInstalled = true;
}

// Auto-install when this module is loaded in browser
if (typeof window !== 'undefined') {
  suppressResizeObserverErrors();
}
