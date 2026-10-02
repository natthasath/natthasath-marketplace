---
name: checkpoint
description: สร้าง git safety commit ก่อนให้ Claude ทำงาน เพื่อป้องกัน code หาย ใช้ skill นี้ก่อนทุกครั้งที่จะให้ Claude implement หรือ refactor เช่น "checkpoint ก่อน", "เซฟ code ก่อน", "ก่อน implement ขอ checkpoint"
argument-hint: "[task-id]"
tools:
  - Read
  - Bash
---

# Checkpoint

สร้าง checkpoint commit ที่ปลอดภัยก่อนเริ่มงาน: $ARGUMENTS

อ่าน `../../references/commit-emoji.md` เพื่อดู emoji convention ก่อน commit

## Core Rules (Non-negotiable)

1. **ห้าม commit เปล่า (empty commit)** — ถ้า `git status` ไม่มีไฟล์เปลี่ยนแปลง ให้แจ้งผู้ใช้แล้วข้ามขั้นตอน stage/commit ไปเลย

## Workflow

### 1. ตรวจสอบไฟล์ที่เปลี่ยนแปลง
รัน `git status` เพื่อดูไฟล์ที่เปลี่ยนแปลง

### 2. Stage และ commit
1. รัน `git add .` เพื่อ stage ทุกอย่าง
2. รัน `git commit -m "🔧 chore: checkpoint before $ARGUMENTS"`

### 3. แจ้งผล
แจ้งผลว่า commit hash คืออะไร พร้อมบอกว่า "ถ้าทุกอย่างพัง ย้อนกลับด้วย: git reset --hard HEAD"

```
─────────────────────────────────────
ถัดไป → /implement $ARGUMENTS
─────────────────────────────────────
```

## Edge cases
- ไม่มีไฟล์เปลี่ยนแปลง → แจ้ง "ไม่มีอะไรต้อง commit — ปลอดภัยที่จะเริ่มงานได้เลย" แล้วข้ามขั้นตอน stage/commit ไปเลย
