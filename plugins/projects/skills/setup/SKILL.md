---
name: setup
description: เริ่มต้น project ใหม่ด้วยการ scaffold โครงสร้าง .claude/ และ context/ ทั้งหมด พร้อม CLAUDE.md, rules, config, task tracking และ workflow skills ครบชุด ใช้ skill นี้เมื่อเริ่ม project ใหม่ เช่น "setup project", "เริ่ม project ใหม่", "สร้าง structure ให้หน่อย"
argument-hint: "[project-name] [description]"
tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
---

เตรียม project structure ใหม่สำหรับการพัฒนาด้วย Claude Code

Project name และ description: $ARGUMENTS

---

## Step 0 — รับข้อมูล

ถ้า $ARGUMENTS ว่างเปล่า ให้ถามผู้ใช้ก่อน:

```
ชื่อโปรเจคของคุณคืออะไร? (เช่น "My API", "E-commerce Platform")
อธิบายสั้นๆ ว่าโปรเจคนี้ทำอะไร (1-2 ประโยค)
```

Parse $ARGUMENTS เป็น:
- PROJECT_NAME = token แรก (เช่น "my-api") หรือถามถ้าไม่มี
- DESCRIPTION = ส่วนที่เหลือ (quoted string หรือว่างก็ได้)

---

## Step 1 — แสดงแผนและขอ confirm

แสดงรายการสิ่งที่จะสร้าง:

```
🗂️  setup: <PROJECT_NAME>

  📄 สร้าง  CLAUDE.md
  📁 สร้าง  .claude/config/
             ├── current-phase.md
             ├── task-format.md
             └── tech-stack.md
  📁 สร้าง  .claude/rules/
             ├── git-conventions.md
             ├── coding-standards.md
             ├── error-handling.md
             ├── testing-rules.md
             ├── security-rules.md
             └── performance-rules.md
  📁 สร้าง  context/
             ├── plans/PLAN.md
             ├── tasks/backlog/feature_requests.md
             ├── tasks/in_progress/current_sprint.md
             ├── tasks/completed/archive.md
             ├── memory/
             └── docs/

ดำเนินการต่อไหม? (yes / no)
```

รอ confirm ก่อน — ถ้า no หยุดทันที

---

## Step 2 — Execute (หลัง confirm เท่านั้น)

### 2a. สร้าง CLAUDE.md

```markdown
# <PROJECT_NAME> — Claude Code Instructions

## โปรเจคนี้คืออะไร

<DESCRIPTION>

## Tech Stack

(รัน /set-stack เพื่อตั้งค่า — presets: react-vite | python | go | laravel | node-express)

## Architecture

(อธิบาย folder structure และ architecture pattern ที่นี่)

## Key Constraints

- (เพิ่ม constraints ที่สำคัญ)

## Development Principles

1. Test as you build — unit tests เขียนพร้อม implementation
2. Small commits — แต่ละ commit = 1 logical change
3. (เพิ่ม principles ของทีม)

## Git Workflow (Claude Code ไม่ทำอัตโนมัติ)

ดู `.claude/rules/git-conventions.md` สำหรับรายละเอียดทั้งหมด

## Skills ที่ใช้บ่อย

| Skill | ใช้เมื่อ |
|---|---|
| `/set-stack <preset>` | ตั้ง tech stack ครั้งแรก |
| `/checkpoint <task>` | ก่อนให้ Claude ทำงานทุกครั้ง |
| `/status` | ดูภาพรวมโปรเจค |
| `/add-phase <name>` | เพิ่ม development phase |
| `/add-task <desc>` | เพิ่ม task เข้า backlog |
| `/start-task <id>` | เริ่ม task และสร้าง branch |
| `/implement <task-id>` | implement task ตาม spec |
| `/ship [task-id]` | ตรวจสอบก่อน merge |
| `/done-task <id>` | mark task ว่าเสร็จ |
| `/debug <bug>` | วิเคราะห์และแก้ bug |
| `/today` | สรุปงานที่ทำวันนี้ |
```

### 2b. สร้าง .claude/config/current-phase.md

```markdown
---
description: Phase ปัจจุบัน — อัปเดตอัตโนมัติเมื่อรัน /add-phase หรือ /done-phase
---

phase: (ยังไม่มี — รัน /add-phase ก่อน)
```

### 2c. สร้าง .claude/config/task-format.md

```markdown
---
description: Task ID format — แก้ไขได้โดยแก้บรรทัด format: ด้านล่าง
---

## Format

format: phase

## ความหมาย

| format | ตัวอย่าง ID | พฤติกรรม |
|---|---|---|
| phase | TSK-1-001, TSK-2-005 | phase encode ใน ID, นับใหม่ต่อ phase |
| global | TSK-001, TSK-002 | ลำดับ global ไม่ reset ข้าม phase |
```

### 2d. สร้าง .claude/config/tech-stack.md

```markdown
---
description: Tech stack และ commands สำหรับ project นี้ — ตั้งค่าด้วย /set-stack
---

## Stack

(รัน /set-stack <preset> เพื่อตั้งค่า — presets: react-vite | python | go | laravel | node-express)

## Commands

| Role | Command |
|---|---|
| **typecheck** | (ยังไม่ได้ตั้งค่า) |
| **lint** | (ยังไม่ได้ตั้งค่า) |
| **test** | (ยังไม่ได้ตั้งค่า) |
| **test-watch** | (ยังไม่ได้ตั้งค่า) |
| **dev** | (ยังไม่ได้ตั้งค่า) |
| **build** | (ยังไม่ได้ตั้งค่า) |
```

### 2e. สร้าง .claude/rules/ (อ่านจาก references/ แล้ว copy)

อ่านแต่ละไฟล์จาก `references/` ที่ bundled มากับ skill แล้วสร้างไฟล์เหล่านี้ใน `.claude/rules/`:
- `references/git-conventions.md` → `.claude/rules/git-conventions.md`
- `references/coding-standards.md` → `.claude/rules/coding-standards.md`
- `references/error-handling.md` → `.claude/rules/error-handling.md`
- `references/testing-rules.md` → `.claude/rules/testing-rules.md`
- `references/security-rules.md` → `.claude/rules/security-rules.md`
- `references/performance-rules.md` → `.claude/rules/performance-rules.md`

> หมายเหตุ: rules เหล่านี้เป็น starting point ทั่วไป ควรปรับให้เหมาะกับ tech stack ของโปรเจค

### 2f. สร้าง context/plans/PLAN.md

```markdown
# Master Development Plan — <PROJECT_NAME>

## Status Overview

| Phase | Name | Status | Target Date |
|---|---|---|---|
| (ใช้ /add-phase <name> [date] เพื่อเพิ่ม phases) | | | |

**Status Key:** 🔲 Not Started | 🔄 In Progress | ✅ Done | ⏸️ Blocked

## Phase Files

_(อัปเดตอัตโนมัติเมื่อรัน /add-phase)_

## Definition of Done (Global)

A phase is "Done" when ALL of the following are true:
- [ ] All tasks moved to context/tasks/completed/
- [ ] Tests pass (ตาม tech-stack.md commands)
- [ ] No lint/typecheck errors
- [ ] Tested manually or E2E
```

### 2g. สร้าง task files และ directories

สร้าง directories:
- `context/tasks/backlog/`
- `context/tasks/in_progress/`
- `context/tasks/completed/`
- `context/memory/`
- `context/docs/`

สร้าง `context/tasks/backlog/feature_requests.md`:

```markdown
# Feature Requests — <PROJECT_NAME>

## Template

```
## FR-XXX — <ชื่อ feature>

**Priority:** Low
**Phase:** Unassigned

**Description:**
<อธิบาย feature>
```

## Entries

_(ไม่มี feature requests ในขณะนี้)_
```

สร้าง `context/tasks/in_progress/current_sprint.md`:

```markdown
# Current Sprint — In Progress

**Sprint:** (ยังไม่มี — รัน /add-phase แล้ว /start-task เพื่อเริ่ม)
**Started:** —
**Target:** —

---

## Currently Active Tasks

_(ย้าย tasks จาก backlog มาที่นี่เมื่อเริ่มทำ)_

---

## Sprint Log

| Date | Task | Action | Notes |
|---|---|---|---|

---

## Blockers

ไม่มี blockers ปัจจุบัน
```

สร้าง `context/tasks/completed/archive.md`:

```markdown
# Completed Tasks Archive — <PROJECT_NAME>

_(tasks ที่เสร็จแล้วจะถูก append ที่นี่โดย /done-task)_
```

### 2h. Git initial commit

อ่าน `../../references/commit-emoji.md` เพื่อดู emoji convention ก่อน commit

```bash
git add .
git commit -m "🎉 chore: setup project structure — <PROJECT_NAME>"
```

---

## Step 3 — รายงานผล

```
✅ Setup เสร็จแล้ว — <PROJECT_NAME>

  ✓ CLAUDE.md — สร้างแล้ว (เติม Architecture + Constraints เอง)
  ✓ .claude/config/ — 3 ไฟล์ (current-phase, task-format, tech-stack)
  ✓ .claude/rules/ — 6 ไฟล์ (git, coding, error, testing, security, performance)
  ✓ context/plans/PLAN.md — พร้อมสำหรับ /add-phase
  ✓ context/tasks/ — backlog/, in_progress/, completed/ พร้อมแล้ว
  ✓ context/tasks/backlog/feature_requests.md — พร้อมแล้ว
  ✓ context/memory/ — พร้อมแล้ว
  ✓ context/docs/ — พร้อมแล้ว
  ✓ git commit: 🎉 chore: setup project structure — <PROJECT_NAME>
```

---

## Step 4 — Next steps

```
─────────────────────────────────────────────────────────────
ถัดไป → ตั้งค่าโปรเจค (ทำตามลำดับ):

  1. /set-stack <preset>          ตั้ง tech stack
                                  presets: react-vite | python | go | laravel | node-express

  2. แก้ CLAUDE.md                เติม Architecture + Constraints + Principles

  3. /add-phase <name> [date]     เพิ่ม Phase แรก

  4. /add-task <description>      เพิ่ม Tasks แรก

  5. /start-task <TSK-1-001>      เริ่มทำ task แรก
─────────────────────────────────────────────────────────────
```
