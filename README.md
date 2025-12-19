<div align="center">
<img width="1200" height="475" alt="SOMA - Body Measurement Tracker" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# SOMA - Body Measurement Tracker

A full-stack application for tracking body measurements with user authentication. Built with Go (Gin) backend and React (Vite) frontend.

## Features

- 🔐 User registration and authentication (JWT tokens)
- 📊 Track body measurements (weight, chest, waist, arm, leg)
- 📈 View measurement history
- 🎨 Modern responsive UI
- 🐳 Docker support

## Project Structure

```
soma/
├── main.go                 # Application entry point
├── frontend/               # React + Vite frontend
│   ├── src/
│   ├── components/         # React components
│   ├── services/           # API services
│   └── package.json
├── internal/               # Backend Go packages
│   ├── config/            # Configuration management
│   ├── database/          # Database initialization
│   ├── handlers/          # HTTP request handlers
│   ├── middleware/        # Auth middleware
│   ├── models/            # Data models
│   └── routes/            # Route setup
├── go.mod                 # Go dependencies
├── docker-compose.yml     # Docker compose configuration
└── .env.example           # Environment variables template
```

## Prerequisites

- **Go** 1.21+
- **Node.js** 18+
- **npm** or **yarn**

## Setup

### 1. Configure Environment Variables

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

Edit `.env`:
```env
JWT_SECRET=your-secret-key-here        # Use strong random value in production
PORT=8080
DB_PATH=data/soma.db
ENVIRONMENT=development
```

### 2. Backend Setup

```bash
# Install Go dependencies
go mod download

# Run the application
go run main.go
```

The backend API will be available at `http://localhost:8080`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Development server (with live reload)
npm run dev
```

The frontend will be available at `http://localhost:3000`

### 4. Build Frontend for Production

```bash
cd frontend

# Build static files
npm run build

# Output is in frontend/dist/ (served by Go backend)
```

## Running with Docker

```bash
# Build and start all services
docker-compose up --build

# Access the app at http://localhost:8080
```

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login user
- `POST /api/logout` - Logout user

### User
- `GET /api/me` - Get current user info (protected)

### Measurements
- `GET /api/measurements` - Get all measurements (protected)
- `POST /api/measurements` - Add new measurement (protected)
- `PUT /api/measurements/:id` - Update measurement (protected)
- `DELETE /api/measurements/:id` - Delete measurement (protected)

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `JWT_SECRET` | `dev-secret-change-me` | Secret key for JWT signing (change in production!) |
| `PORT` | `8080` | Server port |
| `DB_PATH` | `data/soma.db` | SQLite database path |
| `ENVIRONMENT` | `development` | Environment mode (development/staging/production) |
| `VITE_API_URL` | `http://localhost:8080` | Frontend API endpoint (frontend only) |

## Development

### Backend Architecture

The backend is organized into logical packages:
- **config**: Loads and manages configuration from environment
- **models**: Data models (User, Measurement)
- **database**: Database initialization and schema
- **middleware**: HTTP middleware (authentication)
- **handlers**: HTTP request handlers (organized by domain)
- **routes**: Route registration and API structure

### Frontend Architecture

- **services/api.ts**: Authentication API calls
- **services/db.ts**: Measurement API calls
- **components**: Reusable React components
- **types.ts**: TypeScript type definitions

## Production Deployment

1. Set strong `JWT_SECRET` in environment
2. Set `ENVIRONMENT=production`
3. Build frontend: `npm run build`
4. Build Go binary: `go build`
5. Deploy with proper HTTPS and database backups

## License

MIT
