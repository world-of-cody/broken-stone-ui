import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { SessionStateProvider } from './context/SessionState.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SessionStateProvider>
      <App />
    </SessionStateProvider>
  </React.StrictMode>
);
