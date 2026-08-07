# 🎉 go-gateway

A self-hostable API gateway with per-tenant rate limiting, request signing, and Redis-backed quota tracking.

![license](https://img.shields.io/github/license/acme-co/go-gateway)

### 🐳 Deployment

```shell
docker compose up -d
```

### ⚙️ Configuration

| Variable | Default | Description |
|---|---|---|
| `GATEWAY_PORT` | `8080` | Listen port |
| `REDIS_URL` | `redis://localhost:6379` | Quota store |

### 📜 License

Copyright © 2026 Acme Co., Ltd.

Licensed under the [GNU AGPL v3.0](LICENSE). If you run a modified version as a network service, you must make the source available to its users.
