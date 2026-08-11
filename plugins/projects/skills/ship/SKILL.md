---
name: ship
description: ตรวจสอบ pre-merge checklist ก่อน merge branch ครอบคลุม lint, types, tests และ acceptance criteria ใช้ skill นี้ก่อน merge ทุกครั้ง เช่น "ship task นี้", "merge ได้ไหม", "ตรวจสอบก่อน merge"
argument-hint: "[task-id]"
tools:
  - Read
  - Bash
---

!`cat .claude/config/tech-stack.md 2>/dev/null`

รัน pre-merge ship checklist สำหรับ branch ปัจจุบัน

Task ID (ถ้ามี): $ARGUMENTS

**Step 1 — Technical checks (ใช้ commands จาก tech-stack.md ด้านบน):**
- **typecheck** command
- **lint** command
- **test** command
รายงาน: PASS/FAIL ต่อแต่ละอัน

**Step 2 — Code review:**
- รัน `git diff main...HEAD` เพื่อดูการเปลี่ยนแปลงทั้งหมด
- ตรวจสอบเทียบกับ `.claude/rules/` (coding-standards, security, performance)
- รายงาน: มี blocking issues ไหม

**Step 3 — Task tracking:**
- เช็ค `context/tasks/in_progress/current_sprint.md`
- task ของ branch นี้ถูก mark complete แล้วหรือยัง
- ถ้าระบุ task ID ใน $ARGUMENTS ให้เช็ค acceptance criteria ด้วย

**Step 4 — Definition of Done:**
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
