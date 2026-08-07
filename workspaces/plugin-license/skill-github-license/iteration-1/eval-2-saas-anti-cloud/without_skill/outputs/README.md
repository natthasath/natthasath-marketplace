# 🎉 go-gateway

[![License: BUSL-1.1](https://img.shields.io/badge/License-BUSL--1.1-blue.svg)](LICENSE)
[![Change License: Apache-2.0](https://img.shields.io/badge/Change%20License-Apache--2.0-green.svg)](LICENSES/Apache-2.0.txt)
[![Change Date: 2030--08--07](https://img.shields.io/badge/Change%20Date-2030--08--07-lightgrey.svg)](LICENSE)

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

### 🤝 Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) — it
covers the development workflow and the Contributor License Agreement (CLA)
that all contributors sign.

### 📄 License

go-gateway is **source-available**, not open source, and is licensed under the
[Business Source License 1.1](LICENSE) (`BUSL-1.1`).

In plain terms:

| You want to… | Allowed? |
|---|---|
| Read, fork, study, and modify the source | ✅ Yes |
| Run it in production, including commercially, to serve your own apps and APIs | ✅ Yes |
| Run it as internal infrastructure for your company and its subsidiaries | ✅ Yes |
| Redistribute it, modified or unmodified, under this same license | ✅ Yes |
| Sell consulting, integration, or support around it | ✅ Yes |
| Offer it to third parties as a hosted/managed "API gateway as a service" | ❌ No — [contact us](mailto:licensing@acme.example) for a commercial license |

**Change Date: 2030-08-07.** Each version converts automatically to the
[Apache License 2.0](LICENSES/Apache-2.0.txt) on the Change Date recorded in
its own `LICENSE` file, or four years after that version's first public
release — whichever comes first. Acme advances the Change Date at each release,
and the four-year cap is built into the license, so no version stays restricted
indefinitely.

More detail — including why this license was chosen and answers to the usual
questions — is in [LICENSING.md](LICENSING.md).

> Note: GitHub's sidebar will show this repository's license as "Other",
> because BUSL-1.1 is not OSI-approved. That is expected.

Copyright © 2026 Acme Co., Ltd. See [NOTICE](NOTICE) for third-party
attributions.
