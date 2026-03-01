# API layer

## Структура

API разбит по сущностям в `endpoints/*` на основе `tags` из OpenAPI:
- `health`
- `auth`
- `categories`
- `products`
- `cart`
- `orders`

Для каждой сущности есть 2 файла:
- `<name>.types.ts` — DTO и модели
- `<name>.endpoints.ts` — HTTP-функции и объект `<name>Api`

## Base URL

Базовый URL задается в `src/shared/api/http.ts` через:

- `import.meta.env.VITE_API_URL`

Изменить окружение можно в `.env` (пример в `.env.example`).

## Ошибки

Централизованная нормализация ошибок реализована в `normalizeApiError`:

- `axios error` с `response` -> достаются `status`, `message`, `code`, `details`
- `axios error` без `response` -> `message: "Network error"`
- неизвестная ошибка -> `message: "Unexpected error"`

`http`-клиент использует response interceptor и отклоняет промис уже в формате `ApiError`.

## Токен

Токен для `Authorization: Bearer <token>` берется через `getAccessToken()`.
Сейчас источник — `localStorage` (`accessToken`), но функцию можно расширить для чтения из будущего `authStore` без изменений endpoint-файлов.

## Если OpenAPI изменился

1. Сверить `backend/openapi.yaml` с текущими `*.types.ts`.
2. Обновить DTO и сигнатуры функций в нужной сущности.
3. Проверить экспорт в `src/shared/api/index.ts`.

Принята безопасная интерпретация: `date-time` хранится как `string` (ISO-строка) и не преобразуется автоматически в `Date`.
