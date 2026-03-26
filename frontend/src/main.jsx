import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { BrowserRouter } from 'react-router-dom'

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>,
  );

  // Remove static splash after React starts rendering
  setTimeout(() => {
    const staticSplash = document.getElementById('static-splash');
    if (staticSplash) {
      staticSplash.style.opacity = '0';
      setTimeout(() => staticSplash.remove(), 500);
    }
  }, 100);
}
