# 🎉 go-gateway

A self-hostable API gateway with per-tenant rate limiting, request signing, and Redis-backed quota tracking.

### 🐳 Deployment

```shell
docker compose up -d
```

### ⚙️ Configuration

| Variable | Default | Description |
|---|---|---|
| `GATEWAY_PORT` | `8080` | Listen port |
| `REDIS_URL` | `redis://localhost:6379` | Quota store |
