import React from 'react';

export default class RouteErrorBoundary extends React.Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error) { console.error('[OfflineBridge] Route render failed:', error); }
  render() {
    if (!this.state.failed) return this.props.children;
    return <section className="portal-page" role="alert">
      <p className="eyebrow">Page error</p><h1>This service page could not be loaded</h1>
      <p className="lead">Your saved drafts and queued applications remain on this device. Try the page again or return to the service list.</p>
      <button className="utility-button" onClick={() => this.setState({ failed: false })}>Try again</button>{' '}
      <a href="/services">Browse services</a>
    </section>;
  }
}
