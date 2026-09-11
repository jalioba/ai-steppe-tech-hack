import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { MeetingProvider } from './context/MeetingContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MeetingProvider>
      <App />
    </MeetingProvider>
  </React.StrictMode>
);
