---
name: set-stack
description: ตั้งค่า tech stack สำหรับ project ด้วยการเลือก preset หรือกำหนดเอง เขียนลง .claude/config/tech-stack.md ให้ implement/ship/debug ใช้ commands ถูกต้องอัตโนมัติ ใช้ skill นี้เมื่อเริ่มต้น project หรือเปลี่ยน stack เช่น "ตั้ง stack", "ใช้ Next.js + PostgreSQL"
argument-hint: "[stack-preset หรือกำหนดเอง]"
tools:
  - Write
  - Bash
---

ตั้งค่า tech stack สำหรับ project นี้

**Preset:** $ARGUMENTS

**Presets ที่มี:**
- `react-vite` — React + TypeScript + Vite
- `python` — Python + pytest + ruff + mypy
- `go` — Go + go test + golangci-lint
- `laravel` — Laravel + Pest + Pint + PHPStan
- `node-express` — Node.js + Express + TypeScript + Jest

---

1. ถ้าไม่มี $ARGUMENTS — แสดง presets ทั้งหมดพร้อม commands ตัวอย่าง แล้วถามว่าต้องการใช้อันไหน (หรือกำหนดเอง)

2. เขียน preset ที่เลือกลง `.claude/config/tech-stack.md`:

**react-vite:**
```markdown
---
description: Tech stack และ commands สำหรับ project นี้
---

## Stack
React + TypeScript + Vite

## Commands
| Role | Command |
|---|---|
| **typecheck** | `npm run typecheck` |
| **lint** | `npm run lint` |
| **test** | `npm test -- --run` |
| **test-watch** | `npm test` |
| **dev** | `npm run dev` |
| **build** | `npm run build` |
```

**python:**
```markdown
---
description: Tech stack และ commands สำหรับ project นี้
---

## Stack
Python + pytest + ruff + mypy

## Commands
| Role | Command |
|---|---|
| **typecheck** | `mypy .` |
| **lint** | `ruff check .` |
| **test** | `pytest` |
| **test-watch** | `pytest -f` |
| **dev** | `python main.py` |
| **build** | `pip install -e .` |
```

**go:**
```markdown
---
description: Tech stack และ commands สำหรับ project นี้
---

## Stack
Go

## Commands
| Role | Command |
|---|---|
| **typecheck** | `go vet ./...` |
| **lint** | `golangci-lint run` |
| **test** | `go test ./...` |
| **test-watch** | `go test ./... -v` |
| **dev** | `go run .` |
| **build** | `go build ./...` |
```

**laravel:**
```markdown
---
description: Tech stack และ commands สำหรับ project นี้
---

## Stack
Laravel + PHP

## Commands
| Role | Command |
|---|---|
| **typecheck** | `./vendor/bin/phpstan analyse` |
| **lint** | `./vendor/bin/pint --test` |
| **test** | `./vendor/bin/pest` |
| **test-watch** | `./vendor/bin/pest --watch` |
| **dev** | `php artisan serve` |
| **build** | `php artisan optimize` |
```

**node-express:**
```markdown
---
description: Tech stack และ commands สำหรับ project นี้
---

## Stack
Node.js + Express + TypeScript

## Commands
| Role | Command |
|---|---|
| **typecheck** | `npx tsc --noEmit` |
| **lint** | `npx eslint .` |
| **test** | `npx jest --passWithNoTests` |
| **test-watch** | `npx jest --watch` |
| **dev** | `npm run dev` |
| **build** | `npm run build` |
```

3. ถ้าผู้ใช้ต้องการกำหนดเอง — ช่วยร่าง tech-stack.md ให้ตาม stack ที่บอก พร้อม commands ที่เหมาะสม

4. แจ้งว่า stack ถูกตั้งค่าเป็นอะไรแล้ว และ /implement, /ship, /debug จะใช้ commands เหล่านี้โดยอัตโนมัติ

```
─────────────────────────────────────
ถัดไป → /add-phase <name>   (ถ้ายังไม่มี phase)
         /add-task <desc>    (ถ้ามี phase แล้ว)
─────────────────────────────────────
```
