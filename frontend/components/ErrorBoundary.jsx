import React from 'react';
import { HiExclamationTriangle, HiArrowPath } from 'react-icons/hi2';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-8 max-w-md w-full text-center">
            <div className="p-3 bg-red-500/20 rounded-full w-fit mx-auto mb-6">
              <HiExclamationTriangle className="w-8 h-8 text-red-400" />
            </div>
            
            <h2 className="text-xl font-semibold text-white mb-2">
              Oops! Something went wrong
            </h2>
            
            <p className="text-slate-400 text-sm mb-6">
              A client-side error occurred. Don't worry, your work is saved automatically.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <HiArrowPath className="w-4 h-4" />
                Try Again
              </button>
              
              <button
                onClick={this.handleReload}
                className="w-full bg-slate-700/50 hover:bg-slate-700 text-slate-300 font-medium py-3 px-4 rounded-xl transition-all border border-slate-600/50"
              >
                Reload Page
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-xs text-slate-500 cursor-pointer mb-2">
                  Error Details (Development)
                </summary>
                <pre className="text-xs text-red-400 bg-slate-900/50 p-3 rounded-lg overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;