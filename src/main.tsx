// import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { CustomerAuthProvider, WishlistProvider } from './features/customer';
import { CartProvider, CheckoutProvider, SearchProvider } from './stores';
import './index.css';
import './assets/styles/fonts.css'

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
    <CustomerAuthProvider>
      <WishlistProvider>
        <CartProvider>
          <CheckoutProvider>
            <SearchProvider>
              <BrowserRouter>
                <App />
              </BrowserRouter>
            </SearchProvider>
          </CheckoutProvider>
        </CartProvider>
      </WishlistProvider>
    </CustomerAuthProvider>
  // </StrictMode>,
);
