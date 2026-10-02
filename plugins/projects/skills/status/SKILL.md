---
name: status
description: แสดงภาพรวมสถานะโปรเจค ได้แก่ phase, sprint และ git status ในครั้งเดียว ใช้ skill นี้เมื่อต้องการดูภาพรวม เช่น "status โปรเจค", "ตอนนี้อยู่ที่ไหน", "progress เป็นยังไง"
tools:
  - Read
  - Bash
---

# Project Status Viewer

แสดงภาพรวมสถานะโปรเจคทั้งหมด

## Core Rules (Non-negotiable)

1. **ต้องอ่านครบทั้ง 6 แหล่งข้อมูลก่อนสรุปเสมอ** ห้ามข้ามแหล่งไหนแม้จะดูซ้ำกับที่เคยตอบไปก่อนหน้า
2. **"แนะนำ next action" ต้องมาจากข้อมูลจริงที่อ่านได้ในรอบนี้** ไม่ใช่คำแนะนำทั่วไปที่ไม่อิงสถานะปัจจุบัน

## Workflow

### 1. รวบรวมข้อมูล
อ่านไฟล์และรันคำสั่งเหล่านี้แล้วสรุป:
1. `.claude/config/current-phase.md` → phase number ปัจจุบัน (N)
2. `context/plans/PLAN.md` → ชื่อ phase และ % เสร็จ
3. `context/tasks/in_progress/current_sprint.md` → งานที่กำลังทำ
4. `context/tasks/backlog/phase_<N>_*.md` → top 3 tasks รอทำ (ใช้ N จากข้อ 1)
5. รัน `git status --short` → มี uncommitted changes ไหม
6. รัน `git log --oneline -5` → commits ล่าสุด

### 2. แสดงผล
แสดงผลในรูปแบบนี้:
─────────────────────────────
📍 Phase ปัจจุบัน: [ชื่อ] ([X/Y tasks เสร็จ])
🔄 กำลังทำ: [ชื่อ tasks]
📋 รอทำต่อ: [top 3 tasks จาก backlog]
🌿 Branch: [ชื่อ branch]
📝 Uncommitted: [มี/ไม่มี + จำนวนไฟล์]
🕐 Commit ล่าสุด: [message + เวลา]
─────────────────────────────
แนะนำ next action: [หนึ่งประโยค]

```
─────────────────────────────────────
ถัดไป → /list-task   (ดู tasks ทั้งหมด)
─────────────────────────────────────
```
