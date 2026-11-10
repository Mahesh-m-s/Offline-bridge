import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, WifiOff, CheckCircle2 } from 'lucide-react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e) => {
      // Prevent default Chrome mini-infobar
      e.preventDefault();
      setDeferredPrompt(e);
      // Show custom banner
      setShowPrompt(true);
    };

    const handleAppInstalled = () => {
      console.log('[OfflineBridge PWA] Successfully installed to home screen.');
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('[OfflineBridge PWA] User installation response:', outcome);
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt || isInstalled) {
    return null;
  }

  return (
    <div className="install-banner" role="region" aria-label="Install application banner">
      <div className="install-banner-container">
        <div className="install-banner-icon" aria-hidden="true">
          <Smartphone size={28} />
        </div>
        
        <div className="install-banner-content">
          <h3 className="install-banner-title">Install OfflineBridge on your phone</h3>
          <p className="install-banner-desc">
            Use government forms and submit applications anytime — even when you have <strong>no internet connection</strong>!
          </p>
          <div className="install-banner-features">
            <span className="feature-pill">
              <WifiOff size={14} /> 100% Offline-Ready
            </span>
            <span className="feature-pill">
              <CheckCircle2 size={14} /> Fast & Lightweight
            </span>
          </div>
        </div>

        <div className="install-banner-actions">
          <button
            type="button"
            className="btn btn-primary btn-install"
            onClick={handleInstallClick}
            aria-label="Install OfflineBridge now"
          >
            <Download size={18} />
            <span>Install Now</span>
          </button>
          
          <button
            type="button"
            className="btn-dismiss"
            onClick={handleDismiss}
            aria-label="Dismiss install banner"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
