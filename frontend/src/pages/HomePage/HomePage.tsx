import { Link } from 'react-router-dom';

import styles from './HomePage.module.css';

const ADVANTAGES = [
  {
    title: 'Свежие ингредиенты',
    text: 'Рыба, рис и овощи закупаются ежедневно. Каждый заказ собирается после оплаты.'
  },
  {
    title: 'Быстрая доставка',
    text: 'Курьеры доставляют заказы в среднем за 45 минут по городу.'
  },
  {
    title: 'Прозрачный заказ',
    text: 'Статус заказа, состав корзины и история покупок всегда доступны в профиле.'
  }
];

export function HomePage() {
  return (
    <section className={styles.container}>
      <div className={styles.hero}>
        <p className={styles.kicker}>SUSHI DELIVERY</p>
        <h1 className={styles.title}>Доставка суши и роллов</h1>
        <p className={styles.subtitle}>
          Выбирайте позиции из каталога, оформляйте заказ онлайн и отслеживайте его в профиле.
        </p>
        <div className={styles.actions}>
          <Link to="/catalog" className={`${styles.button} ${styles.primary}`}>
            Перейти в каталог
          </Link>
          <Link to="/cart" className={`${styles.button} ${styles.secondary}`}>
            Открыть корзину
          </Link>
        </div>
      </div>

      <div className={styles.cards}>
        {ADVANTAGES.map((item) => (
          <article key={item.title} className={styles.card}>
            <h2 className={styles.cardTitle}>{item.title}</h2>
            <p className={styles.cardText}>{item.text}</p>
          </article>
        ))}
      </div>

      <div className={styles.infoBlock}>
        <h2 className={styles.infoTitle}>Как оформить заказ</h2>
        <ol className={styles.steps}>
          <li>Выберите категорию и добавьте товары в корзину.</li>
          <li>Перейдите к оформлению и заполните адрес доставки.</li>
          <li>Подтвердите заказ и отслеживайте его статус в профиле.</li>
        </ol>
      </div>
    </section>
  );
}
