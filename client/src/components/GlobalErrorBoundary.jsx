import React from 'react';

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error("Global Error Caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: '#f8d7da', color: '#721c24', minHeight: '100vh', fontFamily: 'sans-serif' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Something went wrong.</h1>
          <p style={{ marginTop: '10px' }}>An unexpected error occurred in the React application.</p>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: '20px', background: 'white', padding: '15px', borderRadius: '8px', border: '1px solid #f5c6cb' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '10px' }}>View Error Details</summary>
            <strong>{this.state.error && this.state.error.toString()}</strong>
            <br /><br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
          <button 
            onClick={() => window.location.reload()} 
            style={{ marginTop: '20px', padding: '10px 20px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default GlobalErrorBoundary;
