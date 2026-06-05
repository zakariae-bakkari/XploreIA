import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    this.setState({ error, info });
    console.error('ErrorBoundary caught', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20 }} className="glass-card">
          <h3 style={{ color: '#ff8b8b' }}>Une erreur est survenue lors du rendu</h3>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#ffdede', marginTop: 12 }}>
            {String(this.state.error && this.state.error.toString())}
          </pre>
          {this.state.info && (
            <details style={{ color: '#ffdede', marginTop: 12 }}>
              <summary>Stack / info</summary>
              <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.info.componentStack}</pre>
            </details>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
