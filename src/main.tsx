import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { CartProvider, CheckoutProvider, SearchProvider } from './stores';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CartProvider>
      <CheckoutProvider>
        <SearchProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </SearchProvider>
      </CheckoutProvider>
    </CartProvider>
  </StrictMode>,
);
