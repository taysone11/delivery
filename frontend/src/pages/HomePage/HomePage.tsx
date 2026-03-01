import styles from './HomePage.module.css';

export function HomePage(): JSX.Element {
  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Sushi Delivery</h1>
      <p className={styles.subtitle}>React 19 + Vite + TypeScript ready.</p>
    </main>
  );
}
