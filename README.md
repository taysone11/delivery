# Delivery Project

Проект состоит из двух частей:

- `backend` — REST API (Express + PostgreSQL)
- `frontend` — клиент (React + Vite + Ant Design)

## Быстрый локальный старт

1. Поднимите PostgreSQL и создайте БД (например, `sushi_delivery_db`).
2. Настройте `.env` в `backend` и `frontend` по файлам `.env.example`.
3. Установите зависимости:

```bash
cd backend && yarn install
cd ../frontend && yarn install
```

4. Примените миграции backend:

```bash
cd backend
psql -h localhost -U postgres -d sushi_delivery_db -f db/migrations/V1__init.sql
psql -h localhost -U postgres -d sushi_delivery_db -f db/migrations/V2__add_order_address_and_comment.sql
```

5. Запустите backend:

```bash
cd backend
yarn dev
```

6. В отдельном терминале запустите frontend:

```bash
cd frontend
yarn dev
```

## Подробные инструкции

- Backend: [backend/README.md](backend/README.md)
- Frontend: [frontend/README.md](frontend/README.md)
