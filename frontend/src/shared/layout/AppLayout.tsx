import { Outlet } from 'react-router-dom';

import { Footer } from '../ui/Footer/Footer';
import { Header } from '../ui/Header/Header';
import styles from './AppLayout.module.css';

export function AppLayout() {
  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
