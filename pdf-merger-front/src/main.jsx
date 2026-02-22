import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css'; // ¡Importante importar los estilos nuevos!
import App from './app/App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);