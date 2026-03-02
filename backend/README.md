# Sushi Delivery Backend

REST API для приложения доставки суши.

## Требования

- Node.js `>= 20`
- Yarn `1.x`
- PostgreSQL `>= 13`

## Переменные окружения

Создайте файл `.env` в папке `backend` (можно скопировать из `.env.example`):

```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=sushi_delivery_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_MAX_POOL_SIZE=10

JWT_SECRET=change_me_to_long_random_secret
JWT_EXPIRES_IN=7d
```

## Локальный запуск

1. Установите зависимости:

```bash
cd backend
yarn install
```

2. Создайте БД в PostgreSQL (например, `sushi_delivery_db`).

3. Примените миграции вручную в порядке версий:

```bash
psql -h localhost -U postgres -d sushi_delivery_db -f db/migrations/V1__init.sql
psql -h localhost -U postgres -d sushi_delivery_db -f db/migrations/V2__add_order_address_and_comment.sql
```

4. (Опционально) Заполните тестовыми данными:

```bash
yarn db:seed
yarn db:seed:products
```

5. Запустите backend:

```bash
yarn dev
```

API будет доступен на `http://localhost:3000/api`.

## Скрипты

- `yarn dev` — запуск в режиме разработки (`tsx watch`)
- `yarn build` — сборка TypeScript
- `yarn start` — запуск собранного приложения
- `yarn db:seed` — базовый сид (роли/пользователи/категории/часть товаров)
- `yarn db:seed:products` — сид каталога (по 10 товаров в категории)
- `yarn db:seed:clear` — очистка данных таблиц
- `yarn db:seed:fresh` — очистка + базовый сид

## OpenAPI / Swagger

- Swagger UI: `http://localhost:3000/docs`
- OpenAPI JSON/YAML: `http://localhost:3000/openapi.yaml`

## Реализованные endpoint'ы

Префикс: `/api`

- `GET /health`
- `POST /auth/register`
- `POST /auth/login`
- `GET /categories`
- `GET /products`
- `GET /products/:productId`
- `GET /cart/me` (JWT: `client`, `admin`)
- `POST /cart/items` (JWT: `client`, `admin`)
- `PATCH /cart/items/:productId/decrement` (JWT: `client`, `admin`)
- `DELETE /cart/items/:productId` (JWT: `client`, `admin`)
- `POST /orders` (JWT: `client`, `admin`)
- `GET /orders/my` (JWT: `client`, `admin`)
