import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { setupResizeObserverErrorHandler } from './utils/observers';

// Initialize ResizeObserver error handler
setupResizeObserverErrorHandler();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);