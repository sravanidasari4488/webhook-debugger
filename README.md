# Webhook Debugger

Webhook Debugger is a full-stack app for capturing, inspecting, replaying, and mocking webhook traffic in real time.

## What It Does

- Creates temporary webhook sessions with unique URLs
- Captures incoming requests (method, headers, body, query params, source IP)
- Streams new requests live to the frontend over WebSockets
- Lets you inspect and replay captured requests
- Lets you configure per-session mock responses

## Environment Variables

Copy `.env.example` to `.env` and set values for your environment.

- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `REDIS_URL`
- `VITE_API_BASE_URL`

## Run Locally With Docker Compose

Create a `docker-compose.yml` with backend + Postgres + Redis services and use:

```bash
docker compose --env-file .env up --build
```

Typical ports:

- Backend: `8080`
- Postgres: `5432`
- Redis: `6379`

The frontend can run with Vite locally and should point to your backend via `VITE_API_BASE_URL`.

## Backend Image Build

The included `Dockerfile` builds the Spring Boot app with Maven and runs the packaged JAR on Java 17.

```bash
docker build -t webhook-debugger-backend .
docker run --env-file .env -p 8080:8080 webhook-debugger-backend
```
