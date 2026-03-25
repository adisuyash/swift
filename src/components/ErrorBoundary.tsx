import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-2xl mx-auto">
          <div className="card bg-red-50 border border-red-200">
            <h2 className="text-xl font-semibold text-red-800 mb-4">
              Something went wrong
            </h2>
            <p className="text-red-700 mb-4">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <details className="text-sm text-red-600">
              <summary className="cursor-pointer font-medium mb-2">
                Error details
              </summary>
              <pre className="bg-white p-2 rounded border border-red-200 overflow-auto text-xs">
                {this.state.error?.stack}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              className="btn-secondary mt-4"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
