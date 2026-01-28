# Pangdip Lucky Draw System

A full-stack Lucky Draw application for Kasetsart Fair (Pangdip Booth).

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- TanStack Query (React Query)
- React Router

### Backend
- Go (Fiber framework)
- Redis (stock management, locking)
- PostgreSQL (transaction logging)

## Quick Start

### Development

1. **Backend** (requires Go, Redis, PostgreSQL):
```bash
cd backend
go mod tidy
go run ./cmd/server
```

2. **Frontend**:
```bash
cd frontend
npm install
npm run dev
```

### Docker (Recommended)

```bash
docker-compose up --build
```

Access:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8080
- Admin Panel: http://localhost:5173/secret-admin-control

## API Endpoints

### Public
- `POST /api/spin` - Spin the lottery

### Admin
- `POST /api/admin/lock` - Lock next prize
- `POST /api/admin/unlock` - Remove lock
- `POST /api/admin/reset` - Reset stocks
- `GET /api/admin/logs` - Get recent logs
- `GET /api/admin/status` - Get lock/stock status
- `GET /api/admin/prizes` - Get prize list

## Prize Configuration

| Prize | Stock | Probability | Trigger Only |
|-------|-------|-------------|--------------|
| MK Duck | 5 | 0% | ✅ |
| Starbucks | 1 | 0% | ✅ |
| 10% Discount | ∞ | 15% | ❌ |
| 5% Discount | ∞ | 35% | ❌ |
| Nothing | ∞ | 50% | ❌ |
