---
name: list-task
description: แสดง task list ทั้งหมด ได้แก่ in progress, backlog แยกตาม priority และ feature requests กรองด้วย keyword หรือ priority ได้ ใช้ skill นี้เมื่อต้องการดู task ที่มีอยู่ เช่น "task ทั้งหมดมีอะไรบ้าง", "ดู backlog"
argument-hint: "[keyword-or-priority]"
tools:
  - Read
  - Bash
---

!`cat .claude/config/current-phase.md 2>/dev/null`

แสดง tasks ที่จะทำต่อไปทั้งหมดในโปรเจค

Filter (optional): $ARGUMENTS — กรองตาม priority (high/medium/low) หรือ keyword ใน title

1. อ่าน `phase:` จาก config ด้านบน แล้วอ่านไฟล์เหล่านี้พร้อมกัน:
   - `context/tasks/in_progress/current_sprint.md` → tasks ที่กำลังทำอยู่
   - `context/tasks/backlog/phase_<N>_*.md` → tasks ที่รอทำ (phase ปัจจุบัน)
   - `context/tasks/backlog/feature_requests.md` → feature requests ที่ยังไม่ได้ assign (ถ้ามี)

2. ถ้ามี $ARGUMENTS ให้ filter เฉพาะ tasks ที่ตรงกับ keyword หรือ priority นั้น

3. แสดงผลในรูปแบบนี้:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 TASK LIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔄 IN PROGRESS
  [TSK-X-XXX] ชื่อ task — X hour(s)

📋 BACKLOG — High Priority
  [TSK-X-XXX] ชื่อ task — X hour(s)

📋 BACKLOG — Medium Priority
  [TSK-X-XXX] ชื่อ task — X hour(s)

📋 BACKLOG — Low Priority
  [TSK-X-XXX] ชื่อ task — X hour(s)

💡 FEATURE REQUESTS (unassigned)
  [FR-XXX] ชื่อ feature — Priority: Low

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 รวม: X tasks (Y in progress, Z รอทำ)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

กฎการแสดงผล:
- ข้าม section ที่ไม่มี tasks
- เรียง Backlog ตาม Priority: High → Medium → Low
- ข้าม tasks ที่มี `Status: ✅ Done`
- Feature Requests แสดงเฉพาะที่ยังไม่ assign phase

```
─────────────────────────────────────
ถัดไป → /start-task [TSK ที่ควรทำต่อไป]
─────────────────────────────────────
```
