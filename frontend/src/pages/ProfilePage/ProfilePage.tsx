import styles from './ProfilePage.module.css';

export function ProfilePage() {
  return (
    <section className={styles.container}>
      <h1 className={styles.title}>Профиль</h1>
      <p className={styles.text}>Заказы пользователя будут отображаться здесь. Пока заглушка.</p>
    </section>
  );
}
