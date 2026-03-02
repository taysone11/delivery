# Sushi Delivery Frontend

Клиентское приложение (React + Vite + Ant Design) для сервиса доставки суши.

## Требования

- Node.js `>= 20`
- Yarn `1.x`
- Запущенный backend (по умолчанию `http://localhost:3000/api`)

## Переменные окружения

Создайте `.env` в папке `frontend` (или скопируйте `.env.example`):

```env
VITE_API_URL=http://localhost:3000/api
```

## Локальный запуск

1. Установите зависимости:

```bash
cd frontend
yarn install
```

2. Запустите dev-сервер:

```bash
yarn dev
```

Приложение обычно будет доступно на `http://localhost:5173`.

## Скрипты

- `yarn dev` — запуск Vite dev server
- `yarn build` — typecheck + production build
- `yarn preview` — предпросмотр production-сборки
- `yarn lint` — запуск ESLint
- `yarn format` — форматирование Prettier

## Структура (кратко)

- `src/pages` — страницы приложения
- `src/features` — feature-модули (auth, cart, catalog)
- `src/shared/api` — API-клиент и endpoint-слой
- `src/shared/ui` — общие UI-компоненты
- `public/images/products` — локальные картинки товаров (используются через пути вида `/images/products/...`)
