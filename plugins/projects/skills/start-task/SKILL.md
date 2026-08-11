---
name: start-task
description: เริ่มทำงาน task โดยย้าย task จาก backlog เข้า sprint และแนะนำชื่อ git branch ที่ควรสร้าง ใช้ skill นี้ก่อน /checkpoint และ /implement เช่น "เริ่ม task นี้", "start task", "จะทำ task นี้แล้ว"
argument-hint: "[task-id]"
tools:
  - Read
  - Edit
  - Bash
---

!`cat .claude/config/current-phase.md 2>/dev/null`

เริ่มทำงาน task: $ARGUMENTS

1. อ่าน `phase:` จาก config ด้านบน แล้วกำหนด backlog file เป็น `context/tasks/backlog/phase_<N>_*.md`
   (glob หา filename จริงจาก pattern นั้น)

2. อ่าน `context/tasks/in_progress/current_sprint.md`
   - ถ้า task `$ARGUMENTS` มี status 🔄 อยู่แล้ว — แจ้ง "Task นี้อยู่ใน sprint แล้ว" แล้วหยุด

3. อ่าน backlog file ที่ได้จากข้อ 1
   - ค้นหา section ของ task `$ARGUMENTS`
   - ถ้าไม่เจอ — สแกน backlog ทุก phase ใน `context/tasks/backlog/` แล้วแจ้งว่าพบใน phase ไหน
   - เปลี่ยน `**Status:** Backlog` เป็น `**Status:** 🔄 In Progress`

4. แก้ `context/tasks/in_progress/current_sprint.md`
   - เพิ่ม entry ใหม่ใน "Currently Active Tasks":
     ```
     ## $ARGUMENTS — <ชื่อ task จาก backlog>

     **Status:** 🔄 In Progress
     **Started:** YYYY-MM-DD
     **Estimate:** <จาก backlog>

     **Notes:** -

     ---
     ```
   - เพิ่ม row ใน Sprint Log: `| YYYY-MM-DD | $ARGUMENTS | Started | - |`

5. แนะนำชื่อ git branch ที่ควรสร้าง เช่น `feature/<task-id>-<short-description>`

6. แจ้งให้รัน:
   ```
   git checkout -b <branch-name>
   ```

   แล้วปิดท้ายด้วยบรรทัดนี้เสมอ:

   ```
   ─────────────────────────────────────
   ถัดไป → /checkpoint $ARGUMENTS
   ─────────────────────────────────────
   ```
