# Sushi Delivery Backend

Backend-сервис для веб-приложения доставки еды из суши-бара.

## Технологии

- Node.js 20+
- Express
- TypeScript
- PostgreSQL (`pg`)

## Структура проекта

```text
backend/
  db/
    migrations/
      V1__init.sql
  src/
    app.ts
    server.ts
    config/
      env.ts
    controllers/
    middleware/
    repositories/
    routes/
    services/
      auth/
        auth-service.ts
        auth-service.types.ts
      cart/
        cart-service.ts
        cart-service.types.ts
      categories/
        categories-service.ts
        categories-service.types.ts
      products/
        products-service.ts
        products-service.types.ts
      orders/
        orders-service.ts
        orders-service.types.ts
    types/
      auth.ts
      http.ts
      entities/
        *.ts
    docs/
      swagger-docs.ts
```

## Архитектура

Слои:

1. `routes` — связывание URL и контроллеров.
2. `controllers` — HTTP-уровень (req/res, коды ответов, вызов сервисов).
3. `services` — бизнес-логика.
4. `repositories` — SQL и работа с БД.
5. `db` — подключение к PostgreSQL.

Принцип зависимостей: `routes -> controllers -> services -> repositories -> db`.

## Типизация

Правила работы с типами:

1. Бизнес-сущности хранятся в `src/types/entities`.
2. Типы конкретного сервиса хранятся рядом с сервисом в `*-service.types.ts`.
3. Сервис использует типы из своего `*-service.types.ts`.
4. Если контроллеру нужен тип сервиса, он импортирует его из `services/<entity>/<entity>-service.types.ts`.
5. HTTP-ошибки и общие транспортные типы — в `src/types/http.ts`.

## API

Базовый префикс: `/api`

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/categories`
- `GET /api/products`
- `GET /api/cart/me` (JWT: `client`, `admin`)
- `POST /api/orders` (JWT: `client`, `admin`)

Сейчас реализованы `health` и `auth`. Остальные endpoint'ы пока возвращают `501 Not implemented`.

## OpenAPI и Swagger

- OpenAPI-файл: `openapi.yaml`
- Swagger UI: `GET /docs`
- Сырой OpenAPI: `GET /openapi.yaml`

## Переменные окружения

Скопируйте `.env.example` в `.env` и заполните:

- `NODE_ENV`
- `PORT`
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `DB_MAX_POOL_SIZE`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`

## Запуск

```bash
yarn install
yarn dev
```

Сборка/запуск:

```bash
yarn build
yarn start
```

## Работа с БД

Источник истины схемы: миграции в `db/migrations`.

Правила:

1. Не редактировать уже примененные миграции.
2. Любое изменение схемы делать новой миграцией (`V2__...sql`, `V3__...sql`).
3. Именовать миграции по смыслу изменения.

## Соглашения по ответам

- Успешные ответы: JSON.
- Ошибки: JSON

```json
{ "error": "message" }
```

Коды:

- `200` / `201` — успех
- `400` — ошибка валидации
- `401` — не авторизован
- `403` — недостаточно прав
- `404` — не найдено
- `500` — внутренняя ошибка
