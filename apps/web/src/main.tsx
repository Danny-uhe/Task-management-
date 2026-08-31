import React from 'react';
import ReactDOM from 'react-dom/client';
import "./style/theme.css"
import './index.css';

import AppProvider from './app/Providers/AppProvider';
import { AppRouter } from './app/router';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider>
      <AppRouter />
    </AppProvider>
  </React.StrictMode>,
);
