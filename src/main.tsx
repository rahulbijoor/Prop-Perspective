import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConvexProvider } from 'convex/react'
import { convex } from '@/lib/convex'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary'
import './styles/global.css'


const validateEnvironment = () => {
  const missing = !import.meta.env.VITE_CONVEX_URL ? ['VITE_CONVEX_URL'] : [];
  if (missing.length > 0) {
    console.error(`Initialization Error: Missing environment variables: ${missing.join(', ')}`);
    return false;
  }
  return true;
};

const rootElement = document.getElementById('root');
if (rootElement && validateEnvironment() && convex) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <ConvexProvider client={convex}>
          <App />
        </ConvexProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
} else {
  console.error('Application initialization failed: check console for configuration or DOM errors.');
}
