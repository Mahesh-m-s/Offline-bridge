import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

export default function ConnectivityBadge() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div
      id="connectivity-badge"
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 shadow-sm ${
        isOnline
          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/40'
          : 'bg-amber-950/80 text-amber-300 border border-amber-600/50 animate-pulse'
      }`}
      title={isOnline ? 'Internet connection active' : 'Operating in offline mode. Data saved locally.'}
    >
      <span className="relative flex h-2 w-2">
        {isOnline ? (
          <>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </>
        ) : (
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
        )}
      </span>

      {isOnline ? (
        <>
          <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          <span>Online</span>
        </>
      ) : (
        <>
          <WifiOff className="w-3.5 h-3.5 text-amber-400" />
          <span>Offline Mode</span>
        </>
      )}
    </div>
  );
}
