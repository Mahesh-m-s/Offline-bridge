import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/index.css';
import { LanguageProvider } from './context/LanguageContext';
import { registerServiceWorker } from './registerServiceWorker';

// Register Service Worker with lifecycle callbacks
registerServiceWorker({
  onNeedRefresh(updateSW) {
    if (confirm('A newer version of ArivuNet is available. Reload to update?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('ArivuNet: App is cached and ready to run fully offline!');
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </LanguageProvider>
  </React.StrictMode>
);
