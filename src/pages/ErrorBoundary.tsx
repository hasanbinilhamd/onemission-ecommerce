import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center">
          <p className="mb-2 text-sm font-medium uppercase tracking-widest text-neutral-400">
            Something went wrong
          </p>
          <h1 className="mb-4 text-2xl font-bold text-neutral-900">
            Unexpected error
          </h1>
          <p className="mb-8 max-w-sm text-sm text-neutral-500">
            {this.state.error?.message ?? 'An unknown error occurred.'}
          </p>
          <button
            onClick={this.handleReset}
            className="rounded bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
