---
name: add-phase
description: เพิ่ม development phase ใหม่เข้าโปรเจค พร้อมสร้าง phase plan, backlog file และ archive section ใช้ skill นี้เมื่อต้องการแบ่งโปรเจคเป็นช่วงๆ เช่น "เพิ่ม phase ใหม่", "เริ่ม phase ถัดไป"
argument-hint: "[phase-name] [target-date]"
tools:
  - Read
  - Write
  - Edit
  - Bash
---

!`cat context/plans/PLAN.md 2>/dev/null`

# Add Phase

เพิ่ม phase ใหม่เข้าโปรเจค: $ARGUMENTS

**Format:** `/add-phase <ชื่อ phase> [target date]`
**ตัวอย่าง:** `/add-phase "API Integration" 2026-09-01`

## Core Rules (Non-negotiable)

1. **ต้องแสดง draft ให้ผู้ใช้ confirm ก่อนสร้าง/แก้ไฟล์จริงเสมอ** (ขั้นที่ 3) — ห้ามข้ามไปสร้างไฟล์ทันทีแม้ argument จะดูครบถ้วนแล้วก็ตาม
2. **ถ้ามี phase อื่น In Progress อยู่แล้ว ห้ามแก้ `current-phase.md`** — ปล่อย phase ปัจจุบันไว้ตามเดิม ไม่สลับให้เองโดยผู้ใช้ไม่ได้ขอ
3. **ต้องสร้าง/แก้ไฟล์ให้ครบทุกจุดตามลำดับ** (PLAN.md, phase plan file, backlog file, archive section, และ current-phase config ถ้าเข้าเงื่อนไข) ก่อนรายงานว่าสำเร็จ

## Workflow

### 1. วิเคราะห์ argument

แยก $ARGUMENTS ออกเป็น:
- **ชื่อ phase** — ทุกอย่างก่อน date pattern `YYYY-MM-DD` (ถ้ามี)
- **target date** — ถ้ามี date pattern ใน argument ให้ใช้, ถ้าไม่มีให้ใส่ `TBD`
- **slug** — lowercase, replace space ด้วย `-` (เช่น "API Integration" → `api-integration`)

### 2. หา phase number ถัดไป

อ่าน Status Overview table จาก PLAN.md ด้านบน หา phase number สูงสุดแล้วบวก 1
- ถ้าไม่มี phase เลย ให้เริ่มที่ phase `1`

### 3. Draft และขอ confirm

แสดง preview ก่อน:

```
📋 Phase Draft

Phase:   <N> — <ชื่อ>
Target:  <date หรือ TBD>
Files ที่จะสร้าง:
  · context/plans/PLAN.md                          (เพิ่ม row)
  · context/plans/phase_<N>_<slug>.md              (สร้างใหม่)
  · context/tasks/backlog/phase_<N>_backlog.md     (สร้างใหม่)
  · context/tasks/completed/archive.md             (เพิ่ม section)
```

ถามว่า "ต้องการแก้ไขอะไรไหม หรือ OK ให้สร้างเลย?"
รอ confirm ก่อนทำขั้นต่อไป

### 4. อัปเดต PLAN.md

เพิ่ม row ต่อท้าย Status Overview table:
```
| <N> | <ชื่อ> | 🔲 Not Started | <date> |
```

เพิ่ม link ต่อท้าย Phase Files section:
```
- [Phase <N>: <ชื่อ>](phase_<N>_<slug>.md)
```

### 5. สร้าง phase plan file

สร้าง `context/plans/phase_<N>_<slug>.md`:

```markdown
# Phase <N>: <ชื่อ>

**Status:** 🔲 Not Started
**Target:** <date หรือ TBD>
**Depends on:** Phase <N-1> complete
**Goal:** <สรุปสั้นๆ จากชื่อ phase — แก้ไขได้ภายหลัง>

## Objectives

_(เพิ่ม objectives เมื่อวางแผน)_

## Deliverables

_(เพิ่ม deliverables เมื่อวางแผน)_

## Acceptance Criteria

- [ ] _(เพิ่ม criteria เมื่อวางแผน)_
```

### 6. สร้าง backlog file

สร้าง `context/tasks/backlog/phase_<N>_backlog.md`:

```markdown
# Phase <N> Backlog — <ชื่อ>

_(เพิ่ม tasks ด้วย /add-task)_
```

### 7. อัปเดต current-phase config (เฉพาะกรณีแรก)

อ่าน `.claude/config/current-phase.md` — ถ้า `phase:` ยังเป็น "(ยังไม่มี...)" หรือว่างเปล่า
ให้เขียน `phase: <N>` ลงไป เพื่อให้ skills อื่นรู้ว่า phase ปัจจุบันคืออะไร

**ถ้ามี phase อื่น In Progress อยู่แล้ว — ไม่ต้องแก้ไข current-phase.md**

### 8. เพิ่ม section ใน archive

เปิด `context/tasks/completed/archive.md` แล้ว append ต่อท้าย:

```markdown
## Phase <N> Completed Tasks

_(จะมี entries เมื่อ tasks เสร็จ)_

---
```

### 9. Self-check แล้วสรุปผล
*หลักการ: ขั้นตอนนี้แก้ไฟล์หลายไฟล์ติดต่อกัน (PLAN.md, phase file, backlog file, archive, current-phase config) ถ้าไฟล์ใดไฟล์หนึ่งเขียนไม่สำเร็จจะทำให้ state ของโปรเจคไม่ตรงกัน (เช่น PLAN.md มี row ของ phase นี้แต่ไม่มี backlog file จริง) — ตรวจก่อนรายงานว่าสำเร็จจึงปลอดภัยกว่า*
- ก่อนแสดงสรุป ให้ตรวจว่าไฟล์ที่ต้องสร้าง/แก้ทั้งหมด (ตามรายการในขั้นที่ 4-8) ถูกเขียนจริง ถ้าไฟล์ไหนไม่สำเร็จ ให้แก้ไขให้ครบก่อน แล้วตรวจซ้ำอีกรอบก่อนแสดงสรุป

```
✅ Phase <N> — <ชื่อ> สร้างเสร็จแล้ว

ไฟล์ที่สร้าง/แก้ไข:
  ✅ context/plans/PLAN.md
  ✅ context/plans/phase_<N>_<slug>.md
  ✅ context/tasks/backlog/phase_<N>_backlog.md
  ✅ context/tasks/completed/archive.md
  ✅ .claude/config/current-phase.md  (ถ้าเป็น phase แรก)
```

```
─────────────────────────────────────────────────────
ถัดไป → /add-task <description>   (เพิ่ม tasks เข้า phase ใหม่)
         /list-phase               (ดูภาพรวม phases ทั้งหมด)
─────────────────────────────────────────────────────
```
