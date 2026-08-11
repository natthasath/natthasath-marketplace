---
name: list-phase
description: แสดงภาพรวม phases ทั้งหมด พร้อม status, target date และรายละเอียดของแต่ละ phase ใส่ตัวเลขเพื่อดูรายละเอียด phase นั้น ใช้ skill นี้เมื่อต้องการดูภาพรวม phases เช่น "ดู phases ทั้งหมด", "phase ไหนบ้าง"
argument-hint: "[phase-number]"
tools:
  - Read
  - Bash
---

!`cat context/plans/PLAN.md 2>/dev/null`

แสดงภาพรวม phases ของโปรเจค

**Input:** $ARGUMENTS (ถ้าไม่มี = แสดงทุก phase, ถ้ามีตัวเลข = แสดงรายละเอียด phase นั้น)

---

## กรณีไม่มี argument — แสดงภาพรวมทุก phase

อ่าน Status Overview table จาก PLAN.md ด้านบน แล้วแสดงในรูปแบบนี้:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PHASES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

▶ Phase 1 — Foundation            🔄 In Progress   2026-08-01
  Phase 2 — Core Features         🔲 Not Started   2026-09-01
  Phase 3 — Integration           🔲 Not Started   2026-10-01

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 รวม: X phases  |  Active: Phase Y
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

กฎการแสดงผล:
- `▶` นำหน้า phase ที่ status เป็น 🔄 In Progress (active phase ปัจจุบัน)
- ถ้าไม่มี phase ไหน In Progress ให้ `▶` นำหน้า phase แรกที่ยังไม่ Done
- เรียงตาม phase number เสมอ

```
─────────────────────────────────────
ถัดไป → /list-phase <number>   (ดูรายละเอียด phase)
         /list-task             (ดู tasks ใน phase ปัจจุบัน)
─────────────────────────────────────
```

---

## กรณีมี argument เป็นตัวเลข — แสดงรายละเอียด phase นั้น

อ่านไฟล์ phase ที่ระบุ:
```bash
cat context/plans/phase_<N>_*.md 2>/dev/null
```
(แทน `<N>` ด้วย argument ที่ได้รับ)

แสดงในรูปแบบ:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Phase <N> — <ชื่อ phase>
 Status: <status>  |  Target: <date>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Goal: <goal จาก phase file>

Objectives:
  1. <objective 1>
  ...

Acceptance Criteria:
  - [ ] <criteria>
  ...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

```
─────────────────────────────────────
ถัดไป → /list-task   (ดู tasks ใน phase นี้)
─────────────────────────────────────
```
