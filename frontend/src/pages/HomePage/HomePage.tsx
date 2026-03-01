import styles from './HomePage.module.css';

export function HomePage() {
  return (
    <section className={styles.container}>
      <h1 className={styles.title}>Доставка суши</h1>
      <p className={styles.subtitle}>Домашняя страница приложения.</p>
    </section>
  );
}
