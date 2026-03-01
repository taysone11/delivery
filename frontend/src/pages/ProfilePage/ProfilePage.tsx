import { useNavigate } from 'react-router-dom';

import { useAuthStore } from '../../features/auth/authStore';
import styles from './ProfilePage.module.css';

export function ProfilePage() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <section className={styles.container}>
      <h1 className={styles.title}>Профиль</h1>
      <p className={styles.text}>Заказы пользователя будут отображаться здесь. Пока заглушка.</p>
      <button type="button" className={styles.logoutButton} onClick={handleLogout}>
        Выйти
      </button>
    </section>
  );
}
