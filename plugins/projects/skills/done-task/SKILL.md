---
name: done-task
description: Mark task ว่าเสร็จแล้ว ย้ายออกจาก sprint เข้า archive และอัปเดต backlog status ใช้ skill นี้หลัง /ship ผ่านแล้ว เช่น "task นี้เสร็จแล้ว", "ปิด task", "done"
argument-hint: "[task-id]"
tools:
  - Read
  - Edit
  - Bash
---

!`cat .claude/config/current-phase.md 2>/dev/null`

Mark task เสร็จแล้ว: $ARGUMENTS

1. อ่าน `context/tasks/in_progress/current_sprint.md`
   - ค้นหา entry ของ task `$ARGUMENTS`
   - ถ้าไม่เจอ — แจ้งเตือน "Task $ARGUMENTS ไม่อยู่ใน current_sprint.md ลองรัน /start-task $ARGUMENTS ก่อน" แล้วหยุด

2. อ่าน `phase:` จาก config ด้านบน แล้วเปิด `context/tasks/backlog/phase_<N>_*.md`
   - ถ้าไม่พบ task ใน backlog ของ phase ปัจจุบัน ให้สแกน backlog ทุก phase
   - เปลี่ยน `**Status:** Backlog` หรือ `**Status:** 🔄 In Progress` เป็น `**Status:** ✅ Done (YYYY-MM-DD)` โดยใช้วันที่วันนี้

3. แก้ `context/tasks/in_progress/current_sprint.md`
   - **ลบ** entry ทั้งหมดของ task `$ARGUMENTS` ออก (ตั้งแต่ heading ถึง `---` ถัดไป)
   - เพิ่ม row ใน Sprint Log: `| YYYY-MM-DD | $ARGUMENTS | Completed | - |`

4. อ่าน `context/tasks/completed/archive.md` แล้ว append task นี้:
   ```
   ### $ARGUMENTS — <ชื่อ task จาก backlog>

   **Completed:** YYYY-MM-DD
   **Phase:** <phase number>
   **Notes:** -
   ```

5. รัน `git log --oneline -5` เพื่อแสดง commits ที่เกี่ยวข้อง

6. แจ้งสรุป:
   - Task ที่ done
   - ไฟล์ที่ถูก update (backlog, current_sprint, archive)

   แล้วปิดท้ายด้วยบรรทัดนี้เสมอ:

   ```
   ─────────────────────────────────────
   ถัดไป → /status
   ─────────────────────────────────────
   ```
