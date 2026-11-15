import { Component } from 'react';

function createReferenceCode() {
  return `CL-${Date.now().toString(36).toUpperCase()}`;
}

export class ErrorBoundary extends Component {
  state = { hasError: false, referenceCode: null };

  static getDerivedStateFromError() {
    return { hasError: true, referenceCode: createReferenceCode() };
  }

  componentDidCatch(error) {
    console.error(`Route rendering failed (${this.state.referenceCode}).`, error);
  }

  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback;
      return <Fallback referenceCode={this.state.referenceCode} />;
    }
    return this.props.children;
  }
}
