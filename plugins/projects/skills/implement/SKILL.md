---
name: implement
description: Implement task ตาม Acceptance Criteria และตรวจสอบ typecheck/lint/test ก่อนรายงานเสร็จ ใช้ skill นี้เมื่อต้องการให้ Claude ลงมือ code เช่น "implement task นี้", "ทำ task นี้เลย", "เริ่ม code"
argument-hint: "[task-id]"
tools:
  - Read
  - Write
  - Edit
  - Bash
---

!`cat .claude/config/tech-stack.md .claude/config/current-phase.md context/tasks/in_progress/current_sprint.md 2>/dev/null`

Implement task: $ARGUMENTS

1. อ่าน `phase:` จาก config ด้านบน แล้วเปิด `context/tasks/backlog/phase_<N>_*.md` เพื่อหา task `$ARGUMENTS`
   - ถ้าหา task ไม่เจอใน phase ปัจจุบัน ให้สแกน backlog ทุก phase
   - ถ้าไม่เจอเลย ให้แจ้ง error และหยุด

2. ตรวจสอบว่า task นี้อยู่ใน `current_sprint.md` แล้ว (status: 🔄 In Progress)
   - ถ้ายังไม่อยู่ ให้แจ้ง "รัน /start-task $ARGUMENTS ก่อน" แล้วหยุด

3. Implement ตาม Description และ Acceptance Criteria โดยยึดหลัก:
   - Architecture ตาม `CLAUDE.md`
   - Coding standards ตาม `.claude/rules/coding-standards.md`
   - เขียน unit tests ควบคู่กับ implementation

4. หลัง implement เสร็จ รันตรวจสอบตามลำดับ (ใช้ commands จาก tech-stack.md ด้านบน):
   - **typecheck** command
   - **lint** command
   - **test** command

   **ถ้ามี error** — แก้ให้ผ่านก่อนทุกกรณี อย่ารายงานว่าเสร็จจนกว่าทั้ง 3 คำสั่งจะ pass

5. อัปเดต Acceptance Criteria ใน backlog file:
   - เปลี่ยน `- [ ]` เป็น `- [x]` สำหรับทุกข้อที่ implement เสร็จแล้ว
   - ข้อที่ยังไม่เสร็จให้คง `- [ ]` ไว้

6. สรุปผล:
   - ✅ Acceptance Criteria แต่ละข้อ — pass หรือ pending
   - ⚠️ สิ่งที่ยังค้างหรือต้องทำต่อ (ถ้ามี)

   ถ้า criteria ครบทุกข้อ ปิดท้ายด้วย:
   ```
   ─────────────────────────────────────
   ถัดไป → /ship $ARGUMENTS
   ─────────────────────────────────────
   ```

   ถ้ายังมี criteria ค้าง ปิดท้ายด้วย:
   ```
   ─────────────────────────────────────
   ถัดไป → /implement $ARGUMENTS   (criteria ยังไม่ครบ)
   ─────────────────────────────────────
   ```
