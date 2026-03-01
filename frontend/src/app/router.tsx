import { Navigate, Route, Routes } from 'react-router-dom';

import { CartPage } from '../pages/CartPage/CartPage';
import { CatalogPage } from '../pages/CatalogPage/CatalogPage';
import { CheckoutPage } from '../pages/CheckoutPage/CheckoutPage';
import { HomePage } from '../pages/HomePage/HomePage';
import { LoginPage } from '../pages/LoginPage/LoginPage';
import { ProfilePage } from '../pages/ProfilePage/ProfilePage';
import { AppLayout } from '../shared/layout/AppLayout';

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
