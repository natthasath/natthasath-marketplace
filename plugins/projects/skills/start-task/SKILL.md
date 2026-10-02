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

# Task Starter

เริ่มทำงาน task: $ARGUMENTS

## Core Rules (Non-negotiable)

1. **ถ้า task นี้มี status 🔄 อยู่ใน sprint แล้ว ต้องแจ้งแล้วหยุดทันที** ห้ามเพิ่มซ้ำ
2. **ต้องอัปเดตทั้ง 2 ไฟล์ให้ตรงกันเสมอ**: backlog status เปลี่ยนเป็น In Progress และ current_sprint.md มีทั้ง entry ใหม่กับ Sprint Log row ใหม่ — ห้ามอัปเดตแค่ไฟล์เดียวแล้วถือว่าจบ
3. **ถ้าหา task ไม่เจอใน backlog ของ phase ปัจจุบัน ต้องสแกน backlog ทุก phase ก่อนเสมอ** ห้ามสรุปว่าไม่มี task นี้ทันทีโดยไม่สแกนให้ครบ

## Workflow

ทำตาม checklist นี้ทีละข้อจนครบ:
- [ ] หา backlog file ของ phase ปัจจุบัน (หรือสแกนทุก phase ถ้าไม่เจอ)
- [ ] เช็คว่า task อยู่ใน sprint แล้วหรือยัง
- [ ] เปลี่ยน status ใน backlog file เป็น In Progress
- [ ] เพิ่ม entry + Sprint Log row ใน current_sprint.md
- [ ] แนะนำชื่อ branch และคำสั่ง git checkout

### 1. หา backlog file
อ่าน `phase:` จาก config ด้านบน แล้วกำหนด backlog file เป็น `context/tasks/backlog/phase_<N>_*.md`
(glob หา filename จริงจาก pattern นั้น)

### 2. เช็คว่าอยู่ใน sprint แล้วหรือยัง
อ่าน `context/tasks/in_progress/current_sprint.md`
- ถ้า task `$ARGUMENTS` มี status 🔄 อยู่แล้ว — แจ้ง "Task นี้อยู่ใน sprint แล้ว" แล้วหยุด

### 3. อัปเดต backlog file
อ่าน backlog file ที่ได้จากข้อ 1
- ค้นหา section ของ task `$ARGUMENTS`
- ถ้าไม่เจอ — สแกน backlog ทุก phase ใน `context/tasks/backlog/` แล้วแจ้งว่าพบใน phase ไหน
- เปลี่ยน `**Status:** Backlog` เป็น `**Status:** 🔄 In Progress`

### 4. อัปเดต current_sprint.md
แก้ `context/tasks/in_progress/current_sprint.md`
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

### 5. แนะนำ branch
แนะนำชื่อ git branch ที่ควรสร้าง เช่น `feature/<task-id>-<short-description>`

### 6. แจ้งคำสั่งให้รัน
   ```
   git checkout -b <branch-name>
   ```

   แล้วปิดท้ายด้วยบรรทัดนี้เสมอ:

   ```
   ─────────────────────────────────────
   ถัดไป → /checkpoint $ARGUMENTS
   ─────────────────────────────────────
   ```
