# Campus Canteen – pre-order frontend (React + Vite)

## Run

```bash
npm install
npm run dev
```

`npm run dev` starts the frontend at http://localhost:5173 and the Spring backend from
`D:\java_spring_crud` using Docker Compose. The Compose stack also starts PostgreSQL and
pgAdmin. Docker Compose must be installed, and the backend's `.env` file must be configured.
Vite proxies `/menu` and `/orders` requests to the backend at http://localhost:8080, avoiding
browser CORS restrictions. For a production build, copy `.env.example` to `.env` and set
`VITE_API_BASE_URL` to the full backend URL.

## API used

| Purpose            | Call                                   |
| ------------------ | -------------------------------------- |
| Categories         | `GET /menu/categories`                  |
| Menu per category  | `GET /menu?categorySlug=beverages`      |
| Place order        | `POST /orders`                          |
| Order status       | `GET /orders/{orderToken}`              |

## Needs from the backend

- Each menu item must include an `id`. `POST /api/orders` needs `menuItemId`, but the menu
  response currently has no id, so "Place order" shows an error until it is added.
- The status values in `src/config.js` (`STATUS_FLOW`) are assumptions beyond `PLACED`.
  Change them to match your backend's enum.
