import React, { useEffect, useState } from 'react';
import { Download, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import useOnlineStatus from '../hooks/useOnlineStatus';
import { applyServiceWorkerUpdate } from '../serviceWorkerRegistration';
import { subscribeSyncStatus } from '../sync/syncEngine';

export function OfflineControls() {
  const isOnline = useOnlineStatus();
  const [installEvent, setInstallEvent] = useState(null);
  const [updateReady, setUpdateReady] = useState(false);
  const [authRequired, setAuthRequired] = useState(false);
  useEffect(() => {
    const install = (event) => { event.preventDefault(); setInstallEvent(event); };
    const update = () => setUpdateReady(true);
    window.addEventListener('beforeinstallprompt', install); window.addEventListener('offlinebridge:update-ready', update);
    const unsubscribe = subscribeSyncStatus((state) => {
      if (state.event === 'auth_required') setAuthRequired(true);
      if (state.event === 'auth_resumed') setAuthRequired(false);
    });
    return () => { window.removeEventListener('beforeinstallprompt', install); window.removeEventListener('offlinebridge:update-ready', update); unsubscribe(); };
  }, []);
  return <div className="offline-controls" aria-live="polite">
    <span className={`connection-pill ${isOnline ? 'is-online' : 'is-offline'}`}><i>{isOnline ? <Wifi size={15}/> : <WifiOff size={15}/>}</i>{isOnline ? 'Connected' : 'Offline ready'}</span>
    {installEvent && <button className="utility-button" onClick={async () => { await installEvent.prompt(); setInstallEvent(null); }}><Download size={16}/> Install app</button>}
    {updateReady && <button className="utility-button" onClick={() => applyServiceWorkerUpdate()}><RefreshCw size={16}/> Update available</button>}
    {authRequired && <span className="auth-sync-note">Sign in to sync saved items. <Link to="/login" onClick={() => setAuthRequired(false)}>Sign in</Link></span>}
  </div>;
}
