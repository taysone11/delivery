import styles from './CartPage.module.css';

export function CartPage() {
  return (
    <section className={styles.container}>
      <h1 className={styles.title}>Корзина</h1>
      <p className={styles.text}>Здесь будет список товаров в корзине.</p>
    </section>
  );
}
