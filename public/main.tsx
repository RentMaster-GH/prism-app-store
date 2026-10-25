import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Capture browser native install prompt immediately at startup so it is never missed
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.__pwaDeferredPrompt = e as any;
});

createRoot(document.getElementById('root')!).render(<App />);
