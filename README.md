# AURA – Booking Makeup Artist Online

Monorepo with Next.js 14 frontend and Express.js backend.

## Apps
- apps/frontend (Next.js 14, App Router, TS, Tailwind)
- apps/backend (Express.js + Mongoose, TS)
- shared (types/constants)

## Dev
```bash
npm install
npm run dev:backend
npm run dev:frontend
```

Or with Docker Compose:
```bash
docker compose up --build
```

## Environment
See `apps/frontend/ENVIRONMENT.example` and `apps/backend/ENVIRONMENT.example`.

## Deployment
- Frontend: Vercel
- Backend: Render/Heroku/Fly
- Database: MongoDB Atlas
