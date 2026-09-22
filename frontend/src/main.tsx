import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { MidnightWalletProvider } from './context/MidnightWalletContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MidnightWalletProvider>
      <App />
    </MidnightWalletProvider>
  </React.StrictMode>
);
