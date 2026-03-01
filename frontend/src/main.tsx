import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import App from './App';
import { initStores } from './app/initStores';
import 'antd/dist/reset.css';
import 'react-toastify/dist/ReactToastify.css';
import './styles/global.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element was not found');
}

initStores();

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} />
    </BrowserRouter>
  </StrictMode>
);
