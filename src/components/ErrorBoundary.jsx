import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Store error details
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log to Sentry if available
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        tags: { component: 'ErrorBoundary' },
        extra: errorInfo
      });
    }

    // Log to console for debugging
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
          <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full border border-gray-700">
            <div className="text-center">
              <div className="text-6xl mb-4">🥋</div>
              <h2 className="text-2xl font-bold text-white mb-4">
                The Sensei Encountered an Error
              </h2>
              <p className="text-gray-300 mb-6">
                Something went wrong, but don't worry! The Sensei is learning from this mistake.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-lime-400 text-gray-900 p-3 rounded-lg font-medium hover:bg-lime-300 transition-colors"
                >
                  Restart Training
                </button>
                
                <button
                  onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                  className="w-full bg-gray-700 text-white p-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
                >
                  Try Again
                </button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-6 text-left">
                  <summary className="text-gray-400 cursor-pointer hover:text-white">
                    Show Error Details (Dev Mode)
                  </summary>
                  <div className="mt-3 p-3 bg-gray-900 rounded text-sm text-red-300 overflow-auto">
                    <pre>{this.state.error.toString()}</pre>
                    <pre>{this.state.errorInfo.componentStack}</pre>
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
