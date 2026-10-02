---
name: ship
description: ตรวจสอบ pre-merge checklist ก่อน merge branch ครอบคลุม lint, types, tests และ acceptance criteria ใช้ skill นี้ก่อน merge ทุกครั้ง เช่น "ship task นี้", "merge ได้ไหม", "ตรวจสอบก่อน merge"
argument-hint: "[task-id]"
tools:
  - Read
  - Bash
---

!`cat .claude/config/tech-stack.md 2>/dev/null`

# Pre-merge Ship Checklist

รัน pre-merge ship checklist สำหรับ branch ปัจจุบัน

Task ID (ถ้ามี): $ARGUMENTS

## Core Rules (Non-negotiable)

1. **ต้องรัน technical checks จริงจาก command ใน tech-stack.md** (typecheck/lint/test) ห้ามสมมติผลเอาเอง
2. **ห้ามรายงาน "✅ READY TO MERGE" จนกว่าจะตรวจครบทั้ง 4 ขั้นตอนและผ่านจริงทุกข้อใน Definition of Done**
3. **ถ้ามี task ID ระบุมาใน $ARGUMENTS ต้องเช็ค acceptance criteria ของ task นั้นด้วยเสมอ** ไม่ใช่แค่ technical checks

## Workflow

### 1. Technical checks
ใช้ commands จาก tech-stack.md ด้านบน:
- **typecheck** command
- **lint** command
- **test** command
รายงาน: PASS/FAIL ต่อแต่ละอัน

### 2. Code review
- รัน `git diff main...HEAD` เพื่อดูการเปลี่ยนแปลงทั้งหมด
- ตรวจสอบเทียบกับ `.claude/rules/` (coding-standards, security, performance)
- รายงาน: มี blocking issues ไหม

### 3. Task tracking
- เช็ค `context/tasks/in_progress/current_sprint.md`
- task ของ branch นี้ถูก mark complete แล้วหรือยัง
- ถ้าระบุ task ID ใน $ARGUMENTS ให้เช็ค acceptance criteria ด้วย

### 4. Self-check Definition of Done แล้วสรุปผล
ก่อนสรุปผล ให้ไล่ทวน checklist นี้ทีละข้อเทียบกับผลจริงจาก Step 1-3 (self-check) — ห้ามเดาว่าผ่านถ้ายังไม่เห็นผลจริง ข้อไหนยังไม่ผ่านให้ถือว่า NOT READY:
- [ ] TypeScript/type errors: ไม่มี
- [ ] Linter: zero warnings
- [ ] Tests: ผ่าน
- [ ] Acceptance criteria: verified

**สรุปผล:**

ถ้าผ่านทุก step:
```
─────────────────────────────────────────────────
✅ READY TO MERGE

ตัวเลือก:
  A) Merge local:
     git checkout main && git merge <branch> && git push

  B) เปิด Pull Request:
     git push -u origin <branch>
     แล้วเปิด PR บน GitHub/GitLab

ถัดไป → /done-task $ARGUMENTS   (mark task เสร็จ)
─────────────────────────────────────────────────
```

ถ้ายังมีปัญหา:
```
─────────────────────────────
❌ NOT READY — แก้ก่อน:
  · <สิ่งที่ต้องแก้>
─────────────────────────────
```
