import { createRoot } from 'react-dom/client'
import './index.css'


const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>,
  );

  // Remove static splash after React starts rendering with a safer delay
  setTimeout(() => {
    const staticSplash = document.getElementById('static-splash');
    if (staticSplash) {
      staticSplash.style.transition = 'opacity 0.8s ease';
      staticSplash.style.opacity = '0';
      setTimeout(() => staticSplash.remove(), 1000);
    }
  }, 500);
}

// ✅ Register PWA Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
      console.log('[EduShare PWA] Service Worker registered:', registration.scope);

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[EduShare PWA] New version available! Refreshing...');
              // Auto-update silently
              newWorker.postMessage({ type: 'SKIP_WAITING' });
              window.location.reload();
            }
          });
        }
      });
    } catch (error) {
      console.warn('[EduShare PWA] Service Worker registration failed:', error);
    }
  });
}
