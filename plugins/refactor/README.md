# 🎉 refactor

Plugin for improving code and documentation quality — Docker, Shell Script, and README to production-ready standard with consistent patterns.

> [!NOTE]
> ทุก skill ใน plugin นี้เรียกใช้ผ่าน slash command เท่านั้น (`disable-model-invocation: true`) — ไม่ auto-trigger จากบทสนทนา

### ⭐ Skills

| Skill | Description |
|---|---|
| `refactor-compose` | Refactor `docker-compose.yml` and `.env` to best practice |
| `refactor-dockerfile` | Create and refactor `Dockerfile` with security, performance, and layer caching |
| `refactor-shell` | Create and refactor Shell scripts with error handling, logging, and standard structure |
| `refactor-readme` | Refactor `README.md` to a minimal open-source standard — English headers, emoji convention, a leaner dedicated pattern for monorepo sub-folder/component READMEs, a GitHub Alert callout standard, and zone-based horizontal rules |

### 🏆 Usage

ทุก skill รับได้ทั้งไฟล์ที่มีอยู่แล้ว (refactor) และคำอธิบายสิ่งที่ต้องการ (สร้างใหม่)

```
/refactor-compose <path ของ docker-compose.yml>
/refactor-dockerfile <path ของ Dockerfile หรือ stack ที่ต้องการ>
/refactor-shell <path ของ .sh หรืองานที่ต้องการให้ script ทำ>
/refactor-readme <path ของ README.md>
```

### 💎 README Section Emoji Convention

| Emoji | Section | Emoji | Section |
|---|---|---|---|
| 🎉 | Title | 🚀 | Installation |
| 💎 | Repository / About | ⚙️ | Configuration |
| ✨ | Features | 🔑 | API Key / Credentials |
| 🔥 | Performance / Benchmarks | 🐳 | Deployment |
| 🧊 | Tech Stack / Folder Structure | 🏆 | Usage |
| 🧩 | Integrations / Plugins | 👉🏼 | Demo |
| ✅ | Requirements | 📸 | Screenshots |
| 📝 | API Reference | 📅 | Schedule / Cron |
| 🧪 | Testing | ⚠️ | Troubleshooting |
| 🦄 | Roadmap | 🙏 | Contributors / Credits |
| ⚡ | Changelog | 🔔 | Notifications / Webhooks |
| 🛡️ | Security | 📜 | License |
| ✉️ | Contact / Author | 🍺 | Donate / Support |

Full mapping and rules live in [`skills/refactor-readme/references/emoji.md`](skills/refactor-readme/references/emoji.md).
