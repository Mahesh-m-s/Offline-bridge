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
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors ${
        isOnline
          ? 'bg-[#DCFCE7] text-[#087443] border-[#16A34A]'
          : 'bg-[#FEF3C7] text-[#92400E] border-[#D97706]'
      }`}
      title={isOnline ? 'Network status: Online' : 'Network status: Offline (Local storage active)'}
    >
      <span
        className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
          isOnline ? 'bg-[#087443]' : 'bg-[#D97706]'
        }`}
      />
      {isOnline ? (
        <>
          <Wifi className="w-4 h-4 text-[#087443]" />
          <span>Online</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4 text-[#D97706]" />
          <span>Offline Mode</span>
        </>
      )}
    </div>
  );
}
