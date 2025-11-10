import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import axios from 'axios';

// Axios base URL'ini ayarla (production'da environment variable kullan)
// Eğer environment variable yoksa, relative path kullan (Nginx proxy için)
axios.defaults.baseURL = process.env.REACT_APP_API_URL || '/api';

// Axios default header'larını ayarla
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
