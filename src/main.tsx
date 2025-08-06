import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

// Importante: Mais tarde, quando você fizer o deploy do seu site, precisará adicionar a URL do seu site de produção aqui também. Ficaria assim: ["http://localhost:5173", "https://seu-app.web.app"].

// Selecionamos o container
const container = document.getElementById('root');

// Verificamos se o container não é nulo antes de usá-lo
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
} else {
  // Lançamos um erro claro se o elemento root não for encontrado no HTML
  throw new Error(
    "O elemento root com o ID 'root' não foi encontrado no documento. " +
    "Verifique se o seu arquivo public/index.html possui um <div id=\"root\"></div>."
  );
}