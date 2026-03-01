import { NavLink } from 'react-router-dom';

import styles from './Header.module.css';

const NAV_ITEMS = [
  { to: '/', label: 'Главная' },
  { to: '/catalog', label: 'Каталог' },
  { to: '/cart', label: 'Корзина' },
  { to: '/checkout', label: 'Оформление' },
  { to: '/login', label: 'Вход' },
  { to: '/profile', label: 'Профиль' }
] as const;

function getNavLinkClassName({ isActive }: { isActive: boolean }): string {
  return isActive ? `${styles.link} ${styles.active}` : styles.link;
}

export function Header() {
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
        </nav>
        <div className={styles.cartIndicator} aria-label="Количество товаров в корзине">
          Корзина: <span className={styles.badge}>0</span>
        </div>
      </div>
    </header>
  );
}
