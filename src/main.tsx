import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConvexProvider } from 'convex/react'
import { convex } from '@/lib/convex'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary'
import './styles/global.css'


const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;
if (!convexUrl) {
  console.error('Missing VITE_CONVEX_URL. Set it in .env.local.');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ConvexProvider client={convex}>
        <App />
      </ConvexProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
