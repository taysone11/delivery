import styles from './CatalogPage.module.css';

export function CatalogPage() {
  return (
    <section className={styles.container}>
      <h1 className={styles.title}>Каталог</h1>
      <p className={styles.text}>Категории и продукты будут подключены на следующем шаге.</p>
    </section>
  );
}
