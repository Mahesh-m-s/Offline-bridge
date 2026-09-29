import { useEffect, useState } from 'react';
import apiClient from '../api/apiClient';

export default function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(Boolean(navigator.onLine));
  useEffect(() => {
    let active = true;
    const ping = async () => {
      if (!navigator.onLine) { if (active) setIsOnline(false); return; }
      try { await apiClient.get('/health/ready', { timeout: 3000, headers: { 'Cache-Control': 'no-cache' } }); if (active) setIsOnline(true); }
      catch { if (active) setIsOnline(false); }
    };
    const onOnline = () => ping();
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline); window.addEventListener('offline', onOffline);
    ping(); const interval = setInterval(ping, 30000);
    return () => { active = false; clearInterval(interval); window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); };
  }, []);
  return isOnline;
}
