import React from 'react';
import { ShieldCheck, WifiOff, Users } from 'lucide-react';

export default function About() {
  return <section className="portal-page">
    <p className="eyebrow">OfflineBridge • Rural digital access</p><h1>Services that fit local realities</h1>
    <p className="lead">OfflineBridge helps residents discover public services, keep application drafts on their own device and send them when a connection is available.</p>
    <div className="portal-feature-grid">
      <article><WifiOff/><h2>Works offline</h2><p>Forms and saved work remain available during network interruptions.</p></article>
      <article><ShieldCheck/><h2>Designed for privacy</h2><p>Drafts stay in local device storage until they are submitted.</p></article>
      <article><Users/><h2>Built for communities</h2><p>Clear service information supports residents and local service centers.</p></article>
    </div>
  </section>;
}
