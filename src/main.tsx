import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app';
import './index.css';
import { initDB } from './db';

initDB().then(() => {
  ReactDOM.createRoot(document.getElementById('app')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
