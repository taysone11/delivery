import { NavLink } from 'react-router-dom';

import { useAuthStore } from '../../../features/auth/authStore';
import { useCartStore } from '../../../features/cart/cartStore';
import styles from './Header.module.css';

const NAV_ITEMS = [
  { to: '/', label: 'Главная' },
  { to: '/catalog', label: 'Каталог' }
] as const;

function getNavLinkClassName({ isActive }: { isActive: boolean }): string {
  return isActive ? `${styles.link} ${styles.active}` : styles.link;
}

export function Header() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const totalPrice = useCartStore((state) => state.totalPrice());
  const authNavItem = accessToken
    ? { to: '/profile', label: 'Профиль' }
    : { to: '/login', label: 'Вход' };

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <NavLink to="/" className={styles.brand}>
          Доставка суши
        </NavLink>
        <nav className={styles.nav} aria-label="Основная навигация">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className={getNavLinkClassName}>
              {item.label}
            </NavLink>
          ))}
          <NavLink to={authNavItem.to} className={getNavLinkClassName}>
            {authNavItem.label}
          </NavLink>
        </nav>
        <NavLink to="/cart" className={styles.brand}>
          <div className={styles.cartIndicator} aria-label="Количество товаров в корзине">
            Корзина: <span className={styles.badge}>{totalPrice} ₽</span>
          </div>
        </NavLink>
      </div>
    </header>
  );
}
