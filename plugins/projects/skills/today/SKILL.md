---
name: today
description: สรุปงานที่ทำวันนี้ ได้แก่ commits, tasks ที่เสร็จและสิ่งที่ค้างอยู่ ใช้ skill นี้เมื่อต้องการสรุปงานประจำวัน เช่น "วันนี้ทำอะไรไปบ้าง", "สรุปงานวันนี้", "today summary"
tools:
  - Read
  - Bash
---

# Daily Summary

สรุปงานที่ทำวันนี้

## Core Rules (Non-negotiable)

1. **นับเฉพาะ commits ของผู้ใช้ปัจจุบันเท่านั้น** (`--author="$(git config user.name)"`) ไม่รวม commits ของคนอื่นในทีม
2. **กรอง archive.md เฉพาะ entries ที่ `**Completed:**` ตรงกับวันนี้จริง** ไม่ใช่ทั้งหมดที่เคยเสร็จ

## Workflow

### 1. รวบรวมข้อมูล
1. รัน `git log --oneline --since="midnight" --author="$(git config user.name)"` เพื่อดู commits วันนี้
2. อ่าน `context/tasks/in_progress/current_sprint.md` — มีงานที่ยังค้างอยู่ไหม
3. อ่าน `context/tasks/completed/archive.md` — กรอง entries ที่มี `**Completed:** <วันนี้>` เพื่อดู tasks ที่เสร็จวันนี้

### 2. สรุปผล
สรุปใน 3-5 bullet points:
   - ✅ ทำเสร็จแล้ว: (tasks จาก archive + commits)
   - 🔄 กำลังทำ: (tasks ใน current_sprint)
   - 📋 รอทำต่อพรุ่งนี้: (tasks ที่ยังค้างใน current_sprint)

   แล้วปิดท้ายด้วย:

   ```
   ─────────────────────────────────────
   ถัดไป → /status   (ภาพรวมโปรเจค)
   ─────────────────────────────────────
   ```
