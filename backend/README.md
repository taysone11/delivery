# Sushi Delivery Backend

Backend сервис для веб-приложения доставки еды из суши-бара.

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
    db/
      pool.ts
    routes/
    controllers/
    services/
    repositories/
    middleware/
```

## Архитектура

Сервис построен по слоям:

1. `routes`:
Маршруты и связывание URL с контроллерами.

2. `controllers`:
HTTP-уровень: чтение `req`, вызов сервисов, формирование `res`.

3. `services`:
Бизнес-логика и оркестрация сценариев.

4. `repositories`:
Доступ к БД, SQL-запросы, транзакции.

5. `db`:
Подключение к PostgreSQL (pool).

Принцип зависимости: `routes -> controllers -> services -> repositories -> db`.

## Текущие API-модули

Базовый префикс: `/api`

- `GET /api/health`
- `GET /api/categories`
- `GET /api/products`
- `GET /api/cart/me`
- `POST /api/orders`

На текущем этапе, кроме `health`, эндпоинты модулей отдают `501 Not implemented`.

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

## Запуск

```bash
yarn install
yarn dev
```

Сборка и запуск в production:

```bash
yarn build
yarn start
```

## Работа с БД

Источник истины по схеме: SQL-миграции в `db/migrations`.

Текущая базовая миграция:
- `db/migrations/V1__init.sql`

Правила:

1. Не редактировать уже примененную миграцию.
2. Любые изменения схемы оформлять новой миграцией (`V2__...sql`, `V3__...sql`).
3. Имена миграций делать понятными по смыслу изменения.

## Правила разработки сервиса

1. Не обращаться к БД из `controllers` напрямую.
2. SQL держать в `repositories`.
3. Бизнес-правила держать в `services`.
4. Для новых фич создавать модуль целиком: `route + controller + service + repository`.
5. Все новые файлы писать на TypeScript (`.ts`).
6. Для ошибок использовать единый `error-handler` middleware.
7. Все новые endpoint'ы подключать через `src/routes/index.ts`.

## Минимальные соглашения по API

- Успешные ответы: JSON.
- Ошибки: JSON в формате

```json
{ "error": "message" }
```

- Коды статусов:
  - `200`/`201` для успеха
  - `400` для ошибок валидации
  - `404` если ресурс не найден
  - `500` для неожиданных ошибок

## Ближайшие шаги

1. Реализовать `GET /api/categories`.
2. Реализовать `GET /api/products` с фильтрацией по `category_id`.
3. Добавить валидацию входных данных для `orders` и `cart`.
4. Добавить тесты (unit + integration).
