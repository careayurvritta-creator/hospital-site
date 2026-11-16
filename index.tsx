import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './components/ui/reactbits/reactbits.css';
import App from './App';
import { LanguageProvider } from './components/LanguageContext';
import { initErrorTracking } from './analytics/errorTracker';

// Initialize error tracking (Sentry + fallback) before rendering
initErrorTracking();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </React.StrictMode>
);