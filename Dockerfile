# --- Stage 1: Build Frontend ---
FROM node:20-alpine AS build-frontend
WORKDIR /build

# Kopiere nur package files zuerst für besseres Caching
COPY ./frontend/package.json ./frontend/package-lock.json ./
RUN npm ci

# Kopiere den Rest des Frontends
COPY ./frontend .
RUN npm run build

# --- Stage 2: Build Backend ---
FROM golang:1.25-alpine AS build

WORKDIR /build

# Kopiere Go Module Files
COPY go.mod go.sum ./
RUN go mod download

# Kopiere den Go Source Code
COPY main.go .

# Kopiere den Frontend Build in den backend/frontend/dist Ordner (wie im Go Code erwartet)
# Wir erstellen die Struktur ./frontend/dist im Container
COPY --from=build-frontend /build/dist ./frontend/dist

# Build Backend
# WICHTIG: CGO_ENABLED=0 funktioniert hier, weil wir glebarez/sqlite nutzen!
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o ./bin/soma-app ./main.go

# --- Stage 3: Runtime ---
FROM alpine:3

WORKDIR /app

# SQLite Datenvolumen vorbereiten
RUN mkdir -p /app/data && mkdir -p /app/frontend/dist

# Kopiere Binary
COPY --from=build /build/bin/soma-app /usr/bin/soma-app

# Kopiere Frontend Files (Wichtig: Der Go Server sucht in ./frontend/dist relativ zum WORKDIR)
COPY --from=build /build/frontend/dist /app/frontend/dist

# Ports und Volumes
EXPOSE 8080
VOLUME ["/app/data"]

CMD ["/usr/bin/soma-app"]