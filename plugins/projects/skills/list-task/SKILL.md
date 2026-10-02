---
name: list-task
description: แสดง task list ทั้งหมด ได้แก่ in progress, backlog แยกตาม priority และ feature requests กรองด้วย keyword หรือ priority ได้ ใช้ skill นี้เมื่อต้องการดู task ที่มีอยู่ เช่น "task ทั้งหมดมีอะไรบ้าง", "ดู backlog"
argument-hint: "[keyword-or-priority]"
tools:
  - Read
  - Bash
---

!`cat .claude/config/current-phase.md 2>/dev/null`

# Task List Viewer

แสดง tasks ที่จะทำต่อไปทั้งหมดในโปรเจค

Filter (optional): $ARGUMENTS — กรองตาม priority (high/medium/low) หรือ keyword ใน title

## Core Rules (Non-negotiable)

1. **ข้าม section ที่ไม่มี tasks** — ไม่แสดง section เปล่า
2. **เรียง Backlog ตาม Priority เสมอ**: High → Medium → Low
3. **ข้าม tasks ที่มี `Status: ✅ Done`** เสมอ ไม่ว่าจะอยู่ใน section ไหน
4. **Feature Requests แสดงเฉพาะที่ยังไม่ assign phase**

## Workflow

### 1. อ่านข้อมูล
อ่าน `phase:` จาก config ด้านบน แล้วอ่านไฟล์เหล่านี้พร้อมกัน:
- `context/tasks/in_progress/current_sprint.md` → tasks ที่กำลังทำอยู่
- `context/tasks/backlog/phase_<N>_*.md` → tasks ที่รอทำ (phase ปัจจุบัน)
- `context/tasks/backlog/feature_requests.md` → feature requests ที่ยังไม่ได้ assign (ถ้ามี)

### 2. กรองผล (ถ้ามี)
ถ้ามี $ARGUMENTS ให้ filter เฉพาะ tasks ที่ตรงกับ keyword หรือ priority นั้น

### 3. แสดงผล
แสดงผลในรูปแบบนี้ (ตาม Core Rules ด้านบนเรื่องลำดับและการข้าม section):

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

```
─────────────────────────────────────
ถัดไป → /start-task [TSK ที่ควรทำต่อไป]
─────────────────────────────────────
```
