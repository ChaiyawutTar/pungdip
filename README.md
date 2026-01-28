# 🥟 Pangdip Lucky Draw System

A rigged spinning wheel application for Kasetsart Fair (Pungdip Booth). It features a "random" mode that only gives consolidation prizes, and a "locked" mode for manually awarding major prizes via an Admin Panel.

## ✨ Features

- **Public Game** (`/`)
  - Beautiful spinning wheel with smooth animation (`react-custom-roulette`)
  - **Random Mode**: 50% chance of "Better Luck Next time", 50% chance of "Give IG".
  - **Locked Mode**: Stops exactly on the prize selected by Admin.

- **Admin Panel** (`/secret-admin-control`)
  - **Security**: Password protected (Password: `m113`).
  - **Lock System**: Ability to lock ANY prize (MK, Starbucks, Discounts) for the next spin.
  - **Stock Management**: Track and reset prize inventory.
  - **Live Logs**: Real-time view of spin results.

## 🛠️ Tech Stack

### Frontend
- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- react-custom-roulette (Wheel UI)
- TanStack Query (State Management)

### Backend
- Go (Fiber framework)
- Redis (Stock & Lock state)
- PostgreSQL (Persistent logging)

## 🚀 Quick Start

### Docker (Recommended)

1. **Start services**:
   ```bash
   docker-compose up --build -d
   ```

2. **Access the application**:
   - **Frontend**: http://localhost:5173
   - **Backend API**: http://localhost:8080
   - **Admin Panel**: http://localhost:5173/secret-admin-control (Pass: `m113`)

### Manual Setup (Dev)

**Backend**:
```bash
cd backend
go mod tidy
go run ./cmd/server
```

**Frontend**:
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

## 🎰 Prize Logic

| Prize ID | Name | Probability (Random Mode) | Can be Locked? |
|----------|------|---------------------------|----------------|
| `MK_DUCK` | 🦆 MK Duck Card | 0% (Trigger Only) | ✅ Yes |
| `STARBUCKS` | ☕ Starbucks Card | 0% (Trigger Only) | ✅ Yes |
| `DISCOUNT_10` | 🎫 10% Discount | 0% (Trigger Only) | ✅ Yes |
| `DISCOUNT_05` | 🏷️ 5% Discount | 0% (Trigger Only) | ✅ Yes |
| `NOTHING` | 😢 Better Luck Next Time | 50% | ✅ Yes |
| `GIVE_IG` | 📱 Give IG | 50% | ✅ Yes |

## 📝 API Endpoints

- `POST /api/spin` - Process spin (Check lock -> Random -> Result)
- `POST /api/admin/lock` - Set next prize result
- `POST /api/admin/unlock` - Clear lock
- `POST /api/admin/reset` - Reset all stocks
- `GET /api/admin/logs` - View recent activity
