# 🎉 projects

Plugin for **setting up and managing development projects** — scaffolds the `.claude/` and `context/` structure, with skills covering the full workflow from init to ship.

### ⭐ Skills

| Skill | วัตถุประสงค์ |
|---|---|
| `setup` | Scaffold project structure ใหม่ทั้งหมด: CLAUDE.md, .claude/rules/, .claude/config/, context/ |
| `checkpoint` | สร้าง git safety commit ก่อนให้ Claude ทำงาน ป้องกัน code หาย |
| `add-phase` | เพิ่ม development phase ใหม่พร้อม plan file, backlog, และ archive section |
| `add-task` | เพิ่ม task ใหม่เข้า backlog พร้อม Acceptance Criteria |
| `start-task` | เริ่ม task — ย้ายเข้า sprint และแนะนำ git branch |
| `implement` | Implement task ตาม Acceptance Criteria พร้อมรัน typecheck/lint/test |
| `ship` | ตรวจสอบ pre-merge checklist ก่อน merge branch |
| `done-task` | Mark task ว่าเสร็จแล้ว ย้ายเข้า archive |
| `done-phase` | Mark phase ว่าเสร็จแล้ว เลื่อนไป phase ถัดไป |
| `debug` | วิเคราะห์และแก้ bug ด้วย root cause analysis รองรับ --hotfix |
| `status` | แสดงภาพรวมสถานะโปรเจค — phase, sprint, git status |
| `today` | สรุปงานที่ทำวันนี้ — commits, tasks ที่เสร็จ, และสิ่งที่ค้างอยู่ |
| `list-task` | แสดง backlog ทั้งหมด แยก In Progress / Backlog (High/Med/Low) / Feature Requests |
| `list-phase` | แสดง phases ทั้งหมดพร้อม status — ใส่เลข phase เพื่อดู detail |
| `set-stack` | ตั้งค่า tech stack และ commands — presets: react-vite, python, go, laravel, node-express |

### 🔁 Workflow

```shell
# 1. เริ่มต้น project ใหม่
/setup "My API Project" REST API for e-commerce platform

# 2. วางแผน phases
/add-phase "Phase 1: Foundation" 2026-08-15

# 3. เพิ่ม tasks
/add-task "Setup JWT authentication middleware"

# 4. เริ่มทำงาน
/start-task TSK-1-001
/checkpoint TSK-1-001
  ... Claude ทำงาน ...
/implement TSK-1-001
/ship TSK-1-001
/done-task TSK-1-001

# 5. ดูสถานะ
/status
/today
/list-task
/list-phase
```

### 💬 Commit Convention

`checkpoint`, `debug` และ `setup` commit ด้วย emoji นำหน้าตาม [gitmoji](https://gitmoji.dev/) ผสม Conventional Commits — รายการเต็มอยู่ที่ [`references/commit-emoji.md`](references/commit-emoji.md)

| Emoji | Type | Emoji | Type |
|---|---|---|---|
| 🎉 | Initial commit | ✅ | test |
| ✨ | feat | 📦 | build |
| 🐛 | fix | 👷 | ci |
| 🚑️ | hotfix | 🔧 | chore |
| 📝 | docs | 💥 | breaking change |
| ♻️ | refactor | 🔒 | security |

> Extended set (move/rename, dependency, deploy, secrets, i18n, accessibility, experiments) ดูใน reference file

### 💎 Files created by /setup

```
<project>/
├── CLAUDE.md
├── .claude/
│   ├── config/
│   │   ├── current-phase.md
│   │   ├── task-format.md
│   │   └── tech-stack.md
│   └── rules/
│       ├── git-conventions.md
│       ├── coding-standards.md
│       ├── error-handling.md
│       ├── testing-rules.md
│       ├── security-rules.md
│       └── performance-rules.md
└── context/
    ├── plans/PLAN.md
    ├── tasks/
    │   ├── backlog/
    │   │   └── feature_requests.md
    │   ├── in_progress/current_sprint.md
    │   └── completed/archive.md
    ├── memory/
    └── docs/
```

### 💎 /kickoff vs /setup

| ด้าน | `/kickoff` | `/setup` |
|---|---|---|
| Input | Idea ในหัว ยังไม่มีโค้ด | Project name + description |
| Output | masterplan.md blueprint | .claude/ + context/ structure พร้อมใช้งาน |
| Stage | ก่อนเริ่ม code | หลังตัดสินใจเรื่อง stack แล้ว |

> ใช้ร่วมกัน: `/kickoff` แล้ว `/setup` แล้วเริ่ม implement ได้เลย
